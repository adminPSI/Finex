using FinexAPI.Data;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Authorization;
using FinexAPI.Models.PurchaseOrder;
using System.Collections.Generic;
using FinexAPI.Helper;
using Microsoft.IdentityModel.Tokens;
using FinexAPI.Utility;
using System;
using System.Collections;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class IHPOController : BaseController
    {
        private readonly IConfiguration _configuration;
        private readonly FinexAppContext _ihpocontext;
        private readonly IWorkflowEmail _workflowEmail;
        private const string StatusTemplate = "StatusTemplate";
        private const string Created = "Created";
        private readonly EmailNotification _emailNotification;

        public IHPOController(IHttpContextAccessor httpContextAccessor, FinexAppContext context, IWorkflowEmail workflowEmail, IConfiguration configuration,
             EmailNotification emailNotification
          ) : base(httpContextAccessor)
        {
            _ihpocontext = context;
            _workflowEmail = workflowEmail;
            _configuration = configuration;
            _emailNotification = emailNotification;
        }


        [HttpGet("IHPOBasedPO/{poid}")]
        public async Task<ActionResult<IEnumerable<IHPO>>> GetIHPOBasedOnPO(int poid)
        {

            var record = await _ihpocontext.IHPO.Include(x => x.IHPODetails)
                                               .Include(x => x.IHPOApproval)
                                               .Include(x => x.IHPOPricing)
                                               .Include(x => x.IHPODetails.Vendor)
                                               //.Include(x => x.IHPOLineItem)
                                               .Include(x => x.CodeValues)
                                               .Include(x => x.IHPOWorkflowStep)
                                               .Include(x => x.countyPO)
                                               .Where(x => (x.reqPOid == poid
                                               || x.IHPOLineItem.Any(x => x.poid != null && x.poid == poid))
                                               //&& x.complete == false
                                               && x.OrgAccountId == OrgAccountId).AsNoTracking().ToListAsync();


            return Ok(new { record });
        }

        [HttpGet("IHPO")]
        public async Task<ActionResult<IEnumerable<IHPO>>> GetIHPOs(bool desc = true,bool ihpoComplete = false, bool forApproval = false, string sortKey = "modifiedDate", string? ihpoNumber = "", string? vendorname = "", string? description = "", string? status = "", string? reTotal = "", string? reBalance = "", string? poNumber = "", string? search = "", DateTime? reqDate = null, DateTime? reDateComplete = null, int poId = 0, string? year = "", int skip = 0, int take = 0)
        {
            try
            {
                ListResultController<IHPO> _cmnCntrlr = new ListResultController<IHPO>();
                var currentUserWorkflowstep = await _ihpocontext.IHPOWorkflowSteps.FirstOrDefaultAsync(x => WorkFlowRoles.Contains(OrgAccountId + "_" + x.stepRole.ToLower()));

                int.TryParse(year, out var yearVal);

                var ihposQuery = _ihpocontext.IHPO
                                           //.Include(x => x.IHPODetails)
                                           //.Include(x => x.IHPOApproval)
                                           //.Include(x => x.IHPOPricing)
                                           //.Include(x => x.IHPODetails.Vendor!.name)
                                           //.Include(x => x.CodeValues)
                                           //.Include(x => x.countyPO)
                                           //.Include(x => x.IHPOWorkflowStep)
                                           .Where(p => p.complete == ihpoComplete)
                                           .Select(x => new IHPO
                                           {
                                               ID = x.ID,
                                               reqPOid = x.reqPOid,
                                               reqNumber = x.reqNumber,
                                               reqDescription = x.reqDescription,
                                               status = x.status,
                                               statusMessage = x.statusMessage,
                                               reqDate = x.reqDate,
                                               reqDateComplete = x.reqDateComplete,
                                               createdDate = x.createdDate,
                                               createdBy = x.createdBy,
                                               modifiedBy = x.modifiedBy,
                                               workflowStepSeq = x.workflowStepSeq,
                                               modifiedDate = x.modifiedDate,
                                               IHPODetails = new IHPODetails
                                               {
                                                   Vendor = new Vendor
                                                   {
                                                       name = x.IHPODetails != null && x.IHPODetails.Vendor != null ? x.IHPODetails.Vendor.name : "",
                                                       Id = x.IHPODetails != null && x.IHPODetails.Vendor != null ? x.IHPODetails.Vendor.Id : 0
                                                   }
                                               },
                                               IHPOPricing = new IHPOPricing
                                               {
                                                   reqTotalPrice = x.IHPOPricing != null ? x.IHPOPricing.reqTotalPrice : 0,
                                                   reqTotal = x.IHPOPricing != null ? x.IHPOPricing.reqTotal : 0,
                                                   reqBalance = x.IHPOPricing != null ? x.IHPOPricing.reqBalance : 0,
                                               },
                                               IHPOLineItem = x.IHPOLineItem.Select(i => new IHPOLineItem
                                               {
                                                   poid = i.poid
                                               }),
                                               countyPO = new CountyPO
                                               {
                                                   poNumber = x.countyPO!.poNumber
                                               },
                                               IHPOWorkflowStep = new IHPOWorkflowStep
                                               {
                                                   stepLimit = x.IHPOWorkflowStep!.stepLimit,
                                                   stepSeq = x.IHPOWorkflowStep!.stepSeq,
                                                   stepStatus = x.IHPOWorkflowStep!.stepStatus
                                               }
                                           }).AsNoTracking();

                if (ihpoNumber == "" && vendorname == "" && description == "" && status == "" && reTotal == "" && reBalance == "" && poNumber == "" && search == "" && poId == 0 && reqDate == null && reDateComplete == null)
                {
                    
                    //.Where(p => 1==1);
                    ihposQuery = ihposQuery.OrderByCustom(sortKey, desc);

                    if (string.IsNullOrEmpty(year))
                        ihposQuery = ihposQuery.Where(p => p.reqDate.Value.Year >= DateTime.Now.Year - 1);
                    else
                        ihposQuery = ihposQuery.Where(p => p.reqDate.Value.Year == yearVal);

                    if (forApproval)
                    {
                        ihposQuery = FilterIhpo(ihposQuery, currentUserWorkflowstep!);
                    }
                    //ihposQuery.Distinct();

                    return await _cmnCntrlr.returnResponse(take, skip, ihposQuery, 0);
                }
                else if (search == "")
                {
                    if (poId != 0)
                    {
                        var ihpo_poIds =  await _ihpocontext.IHPOLineItem.Where(x => x.poid != null && x.poid == poId).Select(x => x.reqID.Value).ToListAsync();
                            ihpo_poIds.Add(poId);
                        ihpo_poIds = ihpo_poIds.Distinct().ToList();
                        ihposQuery = ihposQuery.Where(p => p.reqPOid == poId || ihpo_poIds.Contains(p.ID));
                    }
                    if (!string.IsNullOrEmpty(ihpoNumber))
                        ihposQuery = ihposQuery.Where(p => p.reqNumber.Contains(ihpoNumber));
                    if (!string.IsNullOrEmpty(description))
                        ihposQuery = ihposQuery.Where(p => p.reqDescription.Contains(description));
                    if (!string.IsNullOrEmpty(status))
                        ihposQuery = ihposQuery.Where(p => p.statusMessage.Contains(status));
                    if (!string.IsNullOrEmpty(vendorname))
                        ihposQuery = ihposQuery.Where(p => p.IHPODetails.Vendor.name.Contains(vendorname));
                    if (!string.IsNullOrEmpty(reTotal))
                        ihposQuery = ihposQuery.Where(p => p.IHPOPricing.reqTotal.ToString().Contains(reTotal));
                    if (!string.IsNullOrEmpty(reBalance))
                        ihposQuery = ihposQuery.Where(p => p.IHPOPricing.reqBalance.ToString().Contains(reBalance));
                    if (!string.IsNullOrEmpty(poNumber))
                        ihposQuery = ihposQuery.Where(p => p.countyPO.poNumber.Contains(poNumber));
                    if (reqDate != null)
                        ihposQuery = ihposQuery.Where(p => p.reqDate.Value.Date == reqDate.Value.Date);
                    if (reDateComplete != null)
                        ihposQuery = ihposQuery.Where(p => p.reqDateComplete.Value.Date == reDateComplete.Value.Date);
                   
                    if (!string.IsNullOrEmpty(year))
                        ihposQuery = ihposQuery.Where(p => p.reqDate.Value.Year == yearVal);

                    ihposQuery = ihposQuery.OrderByCustom(sortKey, desc);

                    if (forApproval)
                    {
                        ihposQuery = FilterIhpo(ihposQuery, currentUserWorkflowstep!);
                    }
                    //ihposQuery = ihposQuery.Distinct();

                    var result = await _cmnCntrlr.returnResponse(take, skip, ihposQuery, 0);

                    return result;
                }
                else
                {
                    search = string.IsNullOrEmpty(search) ? "" : search;

                    ihposQuery= ihposQuery.Where(p => poId == 0 || p.IHPOLineItem.Any(x => x.poid != null && x.poid == poId));

                    if (search != "")
                    {
                        ihposQuery = ihposQuery
                          .Where(p =>
                          ((p.reqNumber.Contains(search) ||
                          p.reqDescription.Contains(search) ||
                          p.IHPOWorkflowStep.stepStatus.Contains(search) ||
                          p.IHPODetails.Vendor.name.Contains(search) ||
                          p.IHPOPricing.reqTotal.ToString().Contains(search) ||
                          p.IHPOPricing.reqBalance.ToString().Contains(search)) ||
                          p.countyPO.poNumber.Contains(search))
                          );
                    }

                    if (!string.IsNullOrEmpty(year))
                        ihposQuery = ihposQuery.Where(p => p.reqDate.Value.Year == yearVal);

                    ihposQuery = ihposQuery.OrderByCustom(sortKey, desc);

                    if (forApproval)
                    {
                        ihposQuery = FilterIhpo(ihposQuery, currentUserWorkflowstep!);
                    }
                    //ihposQuery = ihposQuery.Distinct();

                    var result = await _cmnCntrlr.returnResponse(take, skip, ihposQuery, 0);
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet("MyIHPO")]
        public async Task<ActionResult> MyIHPO(bool desc = true, bool forApproval = false, string sortKey = "modifiedDate", string? ihpoNumber = "", string? vendorname = "", string? description = "", string? status = "", string? reTotal = "", string? reBalance = "", string? poNumber = "", string? search = "", DateTime? reqDate = null, DateTime? reDateComplete = null, int poId = 0, string? year = "", int skip = 0, int take = 0)
        {
            try
            {
                var emp = await _ihpocontext.Employees.FirstOrDefaultAsync(x => x.id == MemberId);
                ListResultController<IHPO> _cmnCntrlr = new ListResultController<IHPO>();
                var currentUserWorkflowstep = await _ihpocontext.IHPOWorkflowSteps.FirstOrDefaultAsync(x => WorkFlowRoles.Contains(OrgAccountId + "_" + x.stepRole.ToLower()));

                int yearVal = 0;
                if (!string.IsNullOrEmpty(year))
                    yearVal = Convert.ToInt32(year);

                var ihposQuery = _ihpocontext.IHPO.Where(p => p.createdBy == emp.userName)
                                           //.Include(x => x.IHPODetails)
                                           //.Include(x => x.IHPOApproval)
                                           //.Include(x => x.IHPOPricing)
                                           //.Include(x => x.IHPODetails.Vendor!.name)
                                           //.Include(x => x.CodeValues)
                                           //.Include(x => x.countyPO)
                                           //.Include(x => x.IHPOWorkflowStep)
                                           .Select(x => new IHPO
                                           {
                                               ID = x.ID,
                                               reqPOid = x.reqPOid,
                                               reqNumber = x.reqNumber,
                                               reqDescription = x.reqDescription,
                                               status = x.status,
                                               statusMessage = x.statusMessage,
                                               reqDate = x.reqDate,
                                               reqDateComplete = x.reqDateComplete,
                                               createdDate = x.createdDate,
                                               createdBy = x.createdBy,
                                               modifiedBy = x.modifiedBy,
                                               workflowStepSeq = x.workflowStepSeq,
                                               modifiedDate = x.modifiedDate,
                                               IHPODetails = new IHPODetails
                                               {
                                                   Vendor = new Vendor
                                                   {
                                                       name = x.IHPODetails != null && x.IHPODetails.Vendor != null ? x.IHPODetails.Vendor.name : "",
                                                       Id = x.IHPODetails != null && x.IHPODetails.Vendor != null ? x.IHPODetails.Vendor.Id : 0
                                                   }
                                               },
                                               IHPOPricing = new IHPOPricing
                                               {
                                                   reqTotalPrice = x.IHPOPricing != null ? x.IHPOPricing.reqTotalPrice : 0,
                                                   reqTotal = x.IHPOPricing != null ? x.IHPOPricing.reqTotal : 0,
                                                   reqBalance = x.IHPOPricing != null ? x.IHPOPricing.reqBalance : 0,
                                               },
                                               IHPOLineItem = x.IHPOLineItem.Select(i => new IHPOLineItem
                                               {
                                                   poid = i.poid
                                               }),
                                               countyPO = new CountyPO
                                               {
                                                   poNumber = x.countyPO!.poNumber
                                               },
                                               IHPOWorkflowStep = new IHPOWorkflowStep
                                               {
                                                   stepLimit = x.IHPOWorkflowStep!.stepLimit,
                                                   stepSeq = x.IHPOWorkflowStep!.stepSeq,
                                                   stepStatus = x.IHPOWorkflowStep!.stepStatus
                                               }
                                           }).AsNoTracking();

                if (ihpoNumber == "" && vendorname == "" && description == "" && status == "" && reTotal == "" && reBalance == "" && poNumber == "" && search == "" && poId == 0 && reqDate == null && reDateComplete == null)
                {
                    ihposQuery = ihposQuery.OrderByCustom(sortKey, desc);

                    if (string.IsNullOrEmpty(year))
                        ihposQuery = ihposQuery.Where(p => p.reqDate.Value.Year >= DateTime.Now.Year - 1);
                    else
                        ihposQuery = ihposQuery.Where(p => p.reqDate.Value.Year == yearVal);

                    if (forApproval)
                    {
                        ihposQuery = FilterIhpo(ihposQuery, currentUserWorkflowstep!);
                    }
                    ihposQuery.GroupBy(x => x.ID).Select(x => x.First());

                    return await _cmnCntrlr.returnResponse(take, skip, ihposQuery, 0);
                }
                else if (search == "")
                {

                    if (poId != 0)
                        ihposQuery = ihposQuery.Where(p => p.reqPOid == poId || p.IHPOLineItem.Any(x => x.poid != null && x.poid == poId));
                    if (!string.IsNullOrEmpty(ihpoNumber))
                        ihposQuery = ihposQuery.Where(p => p.reqNumber.Contains(ihpoNumber));
                    if (!string.IsNullOrEmpty(description))
                        ihposQuery = ihposQuery.Where(p => p.reqDescription.Contains(description));
                    if (!string.IsNullOrEmpty(status))
                        ihposQuery = ihposQuery.Where(p => p.statusMessage.Contains(status));
                    if (!string.IsNullOrEmpty(vendorname))
                        ihposQuery = ihposQuery.Where(p => p.IHPODetails.Vendor.name.Contains(vendorname));
                    if (!string.IsNullOrEmpty(reTotal))
                        ihposQuery = ihposQuery.Where(p => p.IHPOPricing.reqTotal.ToString().Contains(reTotal));
                    if (!string.IsNullOrEmpty(reBalance))
                        ihposQuery = ihposQuery.Where(p => p.IHPOPricing.reqBalance.ToString().Contains(reBalance));
                    if (!string.IsNullOrEmpty(poNumber))
                        ihposQuery = ihposQuery.Where(p => p.countyPO.poNumber.Contains(poNumber));
                    if (reqDate != null)
                        ihposQuery = ihposQuery.Where(p => p.reqDate.Value.Date == reqDate.Value.Date);
                    if (reDateComplete != null)
                        ihposQuery = ihposQuery.Where(p => p.reqDateComplete.Value.Date == reDateComplete.Value.Date);

                    ihposQuery = ihposQuery.OrderByCustom(sortKey, desc);

                    if (forApproval)
                    {
                        ihposQuery = FilterIhpo(ihposQuery, currentUserWorkflowstep!);
                    }
                    ihposQuery = ihposQuery.GroupBy(x => x.ID).Select(x => x.First());

                    var result = await _cmnCntrlr.returnResponse(take, skip, ihposQuery, 0);

                    return result;
                }
                else
                {
                    search = string.IsNullOrEmpty(search) ? "" : search;
                    //var ihposQuery = _ihpocontext.IHPO.Include(x => x.IHPODetails)
                    //    .Include(x => x.IHPOApproval)
                    //    .Include(x => x.IHPOPricing)
                    //    .Include(x => x.IHPODetails.Vendor)
                    //    .Include(x => x.CodeValues)
                    //    .Include(x => x.countyPO)
                    //    .Include(x => x.IHPOWorkflowStep)
                    //    .Where(p => p.createdBy == emp.userName
                    //    && (poId == 0 || p.IHPOLineItem.Any(x => x.poid == poId && x.poid != null))
                    //    ).OrderByCustom(sortKey, desc);

                    if (search != "")
                    {
                        ihposQuery = ihposQuery
                          .Where(p =>
                          ((p.reqNumber.Contains(search) ||
                          p.reqDescription.Contains(search) ||
                          p.IHPOWorkflowStep.stepStatus.Contains(search) ||
                          p.IHPODetails.Vendor.name.Contains(search) ||
                          p.IHPOPricing.reqTotal.ToString().Contains(search) ||
                          p.IHPOPricing.reqBalance.ToString().Contains(search)) ||
                          p.countyPO.poNumber.Contains(search))
                          );
                    }

                    ihposQuery = ihposQuery.OrderByCustom(sortKey, desc);

                    if (forApproval)
                    {
                        ihposQuery = FilterIhpo(ihposQuery, currentUserWorkflowstep!);
                    }
                    ihposQuery = ihposQuery.GroupBy(x=>x.ID).Select(x=>x.First());

                    var result = await _cmnCntrlr.returnResponse(take, skip, ihposQuery, 0);
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private IQueryable<IHPO> FilterIhpo(IQueryable<IHPO> ihpos, IHPOWorkflowStep workflow)
        {
            if (workflow != null && workflow.stepLimit > 0)
            {
                return ihpos.Where(x => x.IHPOPricing.reqTotalPrice >= workflow.stepLimit && x.workflowStepSeq == workflow.stepSeq - 1);
            }
            else if (workflow != null)
            {
                return ihpos.Where(x => x.workflowStepSeq == workflow.stepSeq - 1);
            }
            else
            {
                return ihpos;
            }
        }


        [HttpGet("IHPO/{id}")]
        public async Task<ActionResult<IHPO>> GetIHPO(int id)
        {
            var query = await _ihpocontext.IHPO.Include(x => x.IHPODetails)
                                              .Include(x => x.IHPOApproval)
                                              .Include(x => x.IHPOPricing)
                                              .Include(x => x.IHPODetails.Vendor)
                                              .Include(x => x.CodeValues)
                                              .Include(x => x.countyPO)
                                              .Include(x => x.IHPOWorkflowStep)
                                              .Where(x => x.ID == id && x.OrgAccountId == OrgAccountId)
                                              .FirstOrDefaultAsync();



            return Ok(query);


        }

        [Route("IHPOLineItem/{ihpoId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IHPOLineItem>>> GetIHPOLineItem(int ihpoId, int? skip = null, int? pageCount = null)
        {
            var total = 0;
            var record = new List<IHPOLineItem>();
            if (skip != null && pageCount != null)
            {
                var query = await _ihpocontext.IHPO.Include(x => x.IHPOLineItem)
                                                  .Where(x => x.ID == ihpoId)
                                                  .Select(x => x.IHPOLineItem).FirstOrDefaultAsync();
                total = query.Count();
                record = query.Skip(skip.Value).Take(pageCount.Value).ToList();
            }
            else
            {
                record = await _ihpocontext.IHPO.Include(x => x.IHPOLineItem)
                                                 .Where(x => x.ID == ihpoId)
                                                 .Select(x => x.IHPOLineItem.ToList()).FirstOrDefaultAsync();
                total = record.Count;

            }
            foreach (var item in record)
            {
                item.poNumber = await _ihpocontext.CountyPO.Where(x => x.Id == item.poid).Select(x => x.poNumber).FirstOrDefaultAsync();
            }
            return Ok(new { record, total });

        }


        [HttpPost("IHPO")]
        public async Task<ActionResult<IHPO>> PostIHPO(IHPO ihpoObj)
        {
            try
            {
                var data = _ihpocontext.IHPO.Where(x => x.reqNumber == ihpoObj.reqNumber && x.OrgAccountId == OrgAccountId).FirstOrDefault();
                if (data != null)
                {
                    throw new Exception("IHPO Number already Exists");
                }
                else
                {
                    ihpoObj.OrgAccountId = OrgAccountId;
                    var typeid = _ihpocontext.CodeTypes.Where(x => x.description == StatusTemplate).FirstOrDefault()?.Id;
                    var statusid = _ihpocontext.CodeValues.Where(x => x.CODE_TYPE_ID == typeid && x.value == Created).FirstOrDefault()?.Id;
                    ihpoObj.statusMessage = _ihpocontext.CodeValues.Where(x => x.Id == 20).Select(x => x.value).FirstOrDefault();
                    ihpoObj.status = statusid;

                    if (ihpoObj.IHPOLineItem != null) {
                        foreach (var item in ihpoObj.IHPOLineItem)
                            item.balance = item.reqDTotal;
                    }

                    _ihpocontext.IHPO.Add(ihpoObj);
                    await _ihpocontext.SaveChangesAsync();

                }
                return Ok(ihpoObj);


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Route("IHPO/{id}")]
        [HttpPut]
        public async Task<ActionResult<IHPO>> PutIHPO(int id, IHPO ihpoObj)
        {

            try
            {
                if (id != ihpoObj.ID)
                {
                    return BadRequest("IHPO does not match with id");
                }
                var ihpoRef = await _ihpocontext.IHPO.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.ID == id);
                var ihpoDetailsRef = await _ihpocontext.IHPODetails.Where(x => x.reqID == id).FirstOrDefaultAsync();
                var ihpoPricingRef = await _ihpocontext.IHPOPricing.Where(x => x.reqID == id).FirstOrDefaultAsync();
                if (ihpoRef == null)
                {
                    return BadRequest("IHPO does not exist");
                }
                else
                {
                    ihpoObj.IHPOWorkflowStep = null;
                    //11/28/2023
                    ihpoObj.createdBy = ihpoRef.createdBy;
                    ihpoObj.createdDate = ihpoRef.createdDate;
                    ihpoObj.IHPODetails.createdDate = ihpoDetailsRef.createdDate;
                    ihpoObj.IHPODetails.createdBy = ihpoDetailsRef.createdBy;
                    ihpoObj.IHPOPricing.createdDate = ihpoPricingRef.createdDate;
                    ihpoObj.IHPOPricing.createdBy = ihpoPricingRef.createdBy;
                    ihpoObj.OrgAccountId = OrgAccountId;
                    _ihpocontext.IHPO.Entry(ihpoRef).State = EntityState.Detached;
                    _ihpocontext.IHPODetails.Entry(ihpoDetailsRef).State = EntityState.Detached;
                    _ihpocontext.IHPOPricing.Entry(ihpoPricingRef).State = EntityState.Detached;
                    _ihpocontext.IHPO.Update(ihpoObj);
                    await _ihpocontext.SaveChangesAsync();

                }

                return Ok(ihpoObj);


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }

        [Route("IHPO/{id}")]
        [HttpDelete]
        public async Task<ActionResult<bool>> DeleteIHPO(int id)
        {
            var ihPO = await _ihpocontext.IHPO.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.ID == id);
            var ihPODetails = await _ihpocontext.IHPODetails.Where(x => x.reqID == id).FirstOrDefaultAsync();
            var ihPOApproval = await _ihpocontext.IHPOApproval.Where(x => x.reqID == id).FirstOrDefaultAsync();
            var ihPOPricing = await _ihpocontext.IHPOPricing.Where(x => x.reqID == id).FirstOrDefaultAsync();
            var ihpoLineItem = await _ihpocontext.IHPOLineItem.Where(x => x.reqID == id).ToListAsync();
            var vouchers = await _ihpocontext.VoucherInvoiceLineItems.Where(x => x.ihpoId == id).ToListAsync();
            if (vouchers != null && vouchers.Any())
            {
                return BadRequest("IHPO Attached with voucher");
            }
            if (ihPO != null)
                _ihpocontext.IHPO.Remove(ihPO);
            if (ihPODetails != null)
                _ihpocontext.IHPODetails.Remove(ihPODetails);
            if (ihPOPricing != null)
                _ihpocontext.IHPOPricing.Remove(ihPOPricing);
            if (ihPOApproval != null)
                _ihpocontext.IHPOApproval.Remove(ihPOApproval);
            if (ihpoLineItem != null)
            {
                foreach (var item in ihpoLineItem)
                {
                    _ihpocontext.IHPOLineItem.Remove(item);
                }

            }
            await _ihpocontext.SaveChangesAsync();
            return Ok(true);

        }

        [Route("IHPOLineItem/{id}")]
        [HttpPut]
        public async Task<ActionResult<IHPOLineItem>> PutIHPOLineItem(int id, IHPOLineItem ihpoObj)
        {
            if (ihpoObj.reqDUnitPrice < 0 || ihpoObj.reqDTotal < 0 || (ihpoObj.reqDQuantity != null && int.Parse(ihpoObj.reqDQuantity) < 0))
            {
                return BadRequest("Negative value does not allowed");
            }
            if (id != ihpoObj.ID)
            {
                return BadRequest("IHPOLineItem does not match with id");
            }
            if (ihpoObj.poid != null && ihpoObj.poid > 0)
            {
                var ihpo = await _ihpocontext.IHPO.Where(x => x.OrgAccountId == OrgAccountId && x.ID == ihpoObj.reqID).FirstOrDefaultAsync();
                var po = await _ihpocontext.CountyPO.Where(x => x.Id == ihpoObj.poid && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (po != null && ihpo != null & ihpo.reqDate.Value.Date < po.poOpenDate.Date)
                {
                    return BadRequest("Selected PO Not yet Open");
                }
            }
            string[] codes = (ihpoObj.reqIHAC ?? "").Split('_');
            if ((ihpoObj.reqIHAC ?? "").Contains("-"))
                codes = (ihpoObj.reqIHAC ?? "").Split('-');

            if (codes.Length > 3)
            {
                var ihpo = await _ihpocontext.IHPO.Where(x => x.OrgAccountId == OrgAccountId && x.ID == ihpoObj.reqID).FirstOrDefaultAsync();

                var progRef = await _ihpocontext.IHCPrograms.Where(x => x.code == codes[0] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (progRef != null && ihpo != null && ihpo.reqDate.Value.Date < progRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive program");
                }
                var departmentRef = await _ihpocontext.IHCDepartments.Where(x => x.code == codes[1] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (departmentRef != null && ihpo != null && ihpo.reqDate.Value.Date < departmentRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Department");
                }
                var accountRef = await _ihpocontext.IHCAccounts.Where(x => x.code == codes[2] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (accountRef != null && ihpo != null && ihpo.reqDate.Value.Date < accountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Account");
                }
                var subAccountRef = await _ihpocontext.IHCSubAccounts.Where(x => x.code == codes[3] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (subAccountRef != null && ihpo != null && ihpo.reqDate.Value.Date < subAccountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive SubAccount");
                }
            }

            var currentUserWorkflowLevel = _ihpocontext.IHPOWorkflowSteps.FirstOrDefault(x => Roles.Contains(OrgAccountId + "_" + x.stepRole));
            if (currentUserWorkflowLevel != null)
            {
                if (currentUserWorkflowLevel.stepRole == "FiscalOffice")
                {
                    if (string.IsNullOrEmpty(ihpoObj.sAC) || string.IsNullOrEmpty(ihpoObj.reqIHAC) || ihpoObj.poid == null || ihpoObj.poid == 0)
                    {
                        return BadRequest("PO, SAC and IHAC is Required");
                    }
                    else if (ihpoObj.poid != null && ihpoObj.poid != 0)
                    {
                        var po = await _ihpocontext.CountyPOPricing.Where(x => x.poId == ihpoObj.poid).FirstOrDefaultAsync();
                        if (po != null && po.poBalance < ihpoObj.reqDTotal)
                        {
                            return BadRequest("Selected PO Don't have enough PO Balance, Please select different PO");
                        }
                    }
                    if (!string.IsNullOrEmpty(ihpoObj.reqIHAC))
                    {
                        var ihac = await _ihpocontext.IHACCodes.Where(x => x.ihacCode == ihpoObj.reqIHAC && x.OrgAccountId == OrgAccountId && x.typeCode == 7).FirstOrDefaultAsync();
                        if (ihac != null)
                        {
                            decimal ihacAmount = await _ihpocontext.IHACExpenseAmounts.Where(x => x.ihacCodeId == ihac.Id).SumAsync(x => x.amount);
                            decimal voucherAmount = (decimal)await _ihpocontext.VoucherBreakDowns.Where(x => x.voucherIHAC == ihac.ihacCode).SumAsync(x => x.voucherAmount);
                            decimal ihpoAmount = (decimal)await _ihpocontext.IHPOLineItem.Where(x => x.reqIHAC == ihac.ihacCode).SumAsync(x => x.balance);
                            var ihacBalance = ihacAmount - (voucherAmount + ihpoAmount);
                            if (ihacBalance < ihpoObj.reqDTotal)
                            {
                                return BadRequest("Selected IHAC Don't have enough Balance, Please select different IHAC");
                            }
                        }
                        else
                        {
                            return BadRequest("IHAC does not Exist");
                        }
                    }
                }
                else if (currentUserWorkflowLevel.stepRole == "Department Head")
                {
                    if (!string.IsNullOrEmpty(ihpoObj.reqIHAC))
                    {
                        var ihac = await _ihpocontext.IHACCodes.Where(x => x.ihacCode == ihpoObj.reqIHAC && x.OrgAccountId == OrgAccountId && x.typeCode == 7).FirstOrDefaultAsync();
                        if (ihac != null)
                        {
                            decimal ihacAmount = await _ihpocontext.IHACExpenseAmounts.Where(x => x.ihacCodeId == ihac.Id).SumAsync(x => x.amount);
                            decimal voucherAmount = (decimal)await _ihpocontext.VoucherBreakDowns.Where(x => x.voucherIHAC == ihac.ihacCode).SumAsync(x => x.voucherAmount);
                            decimal ihpoAmount = (decimal)await _ihpocontext.IHPOLineItem.Where(x => x.reqIHAC == ihac.ihacCode).SumAsync(x => x.balance);
                            var ihacBalance = ihacAmount - (voucherAmount + ihpoAmount);
                            if (ihacBalance < ihpoObj.reqDTotal)
                            {
                                return BadRequest("Selected IHAC Don't have enough Balance, Please select different IHAC");
                            }
                        }
                        else
                        {
                            return BadRequest("IHAC does not Exist");
                        }
                    }
                    else
                    {
                        return BadRequest("IHAC is Required");
                    }
                }
            }
            var lineRef = await _ihpocontext.IHPOLineItem.FindAsync(id);
            if (lineRef == null)
            {
                return BadRequest("IHPOLineItem does not exist");
            }
            else
            {
                
                //ihpoObj.createdBy = lineRef.createdBy;
                //ihpoObj.createdDate = lineRef.createdDate;
                _ihpocontext.IHPOLineItem.Entry(lineRef).State = EntityState.Detached;
                _ihpocontext.IHPOLineItem.Update(ihpoObj);
                await _ihpocontext.SaveChangesAsync();

                var pricing = await _ihpocontext.IHPOPricing.FirstOrDefaultAsync(x => x.reqID == ihpoObj.poid);
                if (pricing != null)
                {
                    pricing.reqTotal = await _ihpocontext.IHPOLineItem.Where(x => x.IHPO.ID == ihpoObj.poid).SumAsync(x => x.reqDTotal);
                    pricing.reqBalance = await _ihpocontext.IHPOLineItem.Where(x => x.IHPO.ID == ihpoObj.poid).SumAsync(x => x.balance);

                    await _ihpocontext.SaveChangesAsync();
                }
            }
            return Ok(ihpoObj);


        }

        [Route("IHPOLineItem")]
        [HttpPost]
        public async Task<ActionResult<IHPOLineItem>> PostIHPOLineItem(IHPOLineItem ihpoObj)
        {
            if (ihpoObj.reqDUnitPrice < 0 || ihpoObj.reqDTotal < 0 || (ihpoObj.reqDQuantity != null && int.Parse(ihpoObj.reqDQuantity) < 0))
            {
                return BadRequest("Negative value does not allowed");
            }
            if (ihpoObj == null)
            {
                return BadRequest("IHPOLineItem does not exist");
            }
            else
            {
                ihpoObj.balance = ihpoObj.reqDTotal;
                _ihpocontext.IHPOLineItem.Add(ihpoObj);
                await _ihpocontext.SaveChangesAsync();

                var pricing = await _ihpocontext.IHPOPricing.FirstOrDefaultAsync(x => x.reqID == ihpoObj.poid);
                if (pricing != null)
                {
                    pricing.reqTotal = await _ihpocontext.IHPOLineItem.Where(x => x.IHPO.ID == ihpoObj.poid).SumAsync(x => x.reqDTotal);
                    pricing.reqBalance = await _ihpocontext.IHPOLineItem.Where(x => x.IHPO.ID == ihpoObj.poid).SumAsync(x => x.balance);

                    await _ihpocontext.SaveChangesAsync();
                }
            }
            return Ok(ihpoObj);
        }


        [Route("IHPOLineItem/{id}")]
        [HttpDelete]
        public async Task<ActionResult<bool>> DeleteIHPOLineItem(int id)
        {
            var data = await _ihpocontext.IHPOLineItem.Where(x => x.ID == id).FirstOrDefaultAsync();
            if (data == null)
            {
                return BadRequest("IHPOLineItem does nto exist");
            }
            else
            {

                _ihpocontext.IHPOLineItem.Remove(data);
                await _ihpocontext.SaveChangesAsync();

                var pricing = await _ihpocontext.IHPOPricing.FirstOrDefaultAsync(x => x.reqID == data.poid);
                if (pricing != null)
                {
                    pricing.reqTotal = await _ihpocontext.IHPOLineItem.Where(x => x.IHPO.ID == data.poid).SumAsync(x => x.reqDTotal);
                    pricing.reqBalance = await _ihpocontext.IHPOLineItem.Where(x => x.IHPO.ID == data.poid).SumAsync(x => x.balance);

                    await _ihpocontext.SaveChangesAsync();
                }

                return Ok(true);
            }

        }

        [HttpGet("TemporaryIHPONumber")]
        public ActionResult<string> GetTemporaryIHPONumber()
        {
            //var count = _ihpocontext.IHPO.Count() > 0 ? _ihpocontext.IHPO.OrderBy(x => x.ID).LastOrDefault()?.ID : 0;
            // var count = _ihpocontext.IHPO.Count();
            //var totalCount = _ihpocontext.IHPO.Count() == 0 ? 1 : _ihpocontext.IHPO.Count();
            var nextSequence = _ihpocontext.GetNextSequencevalue("ihposequence_" + OrgAccountId);
            var tl = nextSequence.ToString().Length;
            var tempstring = "0000";
            var tempstringCount = tempstring.Length;
            var take = tempstringCount - tl;
            var str1 = tempstring.Substring(tl, take);
            if (nextSequence == 0)
            {
                nextSequence = 0;
            }
            var str2 = str1 + nextSequence.ToString();
            var dtY = DateTime.Now.Year.ToString();

            return "I" + str2 + "-" + dtY.Substring(2);
        }

        [Route("IHPOApproveStatus")]
        [HttpPut]
        public async Task<ActionResult<IHPOApproval>> IHPOApproveStatus(IHPOApproval app)
        {
            var currentUserWorkflow = _ihpocontext.IHPOWorkflowSteps.FirstOrDefault(x => Roles.Contains(OrgAccountId + "_" + x.stepRole));
            if (currentUserWorkflow != null && !app.selfApprove && app.reqStatusMessage.ToLower().Equals("approved"))
            {
                var ihpoLineItems = await _ihpocontext.IHPOLineItem.Where(x => x.reqID == app.reqID).ToListAsync();
                foreach (var ihpoObj in ihpoLineItems)
                {
                    if (currentUserWorkflow.stepRole == "FiscalOffice")
                    {
                        if (string.IsNullOrEmpty(ihpoObj.sAC) || string.IsNullOrEmpty(ihpoObj.reqIHAC) || ihpoObj.poid == null || ihpoObj.poid == 0)
                        {
                            return BadRequest("PO, SAC and IHAC is Required");
                        }
                        else if (ihpoObj.poid != null && ihpoObj.poid != 0)
                        {
                            var po = await _ihpocontext.CountyPOPricing.Where(x => x.poId == ihpoObj.poid).FirstOrDefaultAsync();
                            if (po != null && po.poBalance < ihpoObj.reqDTotal)
                            {
                                return BadRequest("Selected PO Don't have enough PO Balance, Please select different PO");
                            }
                        }
                        if (!string.IsNullOrEmpty(ihpoObj.reqIHAC))
                        {
                            var ihac = await _ihpocontext.IHACCodes.Where(x => x.ihacCode == ihpoObj.reqIHAC && x.OrgAccountId == OrgAccountId && x.typeCode == 7).FirstOrDefaultAsync();
                            if (ihac != null)
                            {
                                decimal ihacAmount = await _ihpocontext.IHACExpenseAmounts.Where(x => x.ihacCodeId == ihac.Id).SumAsync(x => x.amount);
                                decimal voucherAmount = (decimal)await _ihpocontext.VoucherBreakDowns.Where(x => x.voucherIHAC == ihac.ihacCode).SumAsync(x => x.voucherAmount);
                                decimal ihpoAmount = (decimal)await _ihpocontext.IHPOLineItem.Where(x => x.reqIHAC == ihac.ihacCode).SumAsync(x => x.balance);
                                var ihacBalance = ihacAmount - (voucherAmount + ihpoAmount);
                                if (ihacBalance < ihpoObj.reqDTotal)
                                {
                                    return BadRequest("Selected IHAC Don't have enough Balance, Please select different IHAC");
                                }
                            }
                            else
                            {
                                return BadRequest("IHAC does not Exist");
                            }
                        }
                    }
                    else if (currentUserWorkflow.stepRole == "Department Head")
                    {
                        if (!string.IsNullOrEmpty(ihpoObj.reqIHAC))
                        {
                            var ihac = await _ihpocontext.IHACCodes.Where(x => x.ihacCode == ihpoObj.reqIHAC && x.OrgAccountId == OrgAccountId && x.typeCode == 7).FirstOrDefaultAsync();
                            if (ihac != null)
                            {
                                decimal ihacAmount = await _ihpocontext.IHACExpenseAmounts.Where(x => x.ihacCodeId == ihac.Id).SumAsync(x => x.amount);
                                decimal voucherAmount = (decimal)await _ihpocontext.VoucherBreakDowns.Where(x => x.voucherIHAC == ihac.ihacCode).SumAsync(x => x.voucherAmount);
                                decimal ihpoAmount = (decimal)await _ihpocontext.IHPOLineItem.Where(x => x.reqIHAC == ihac.ihacCode).SumAsync(x => x.balance);
                                var ihacBalance = ihacAmount - (voucherAmount + ihpoAmount);
                                if (ihacBalance < ihpoObj.reqDTotal)
                                {
                                    return BadRequest("Selected IHAC Don't have enough Balance, Please select different IHAC");
                                }
                            }
                            else
                            {
                                return BadRequest("IHAC does not Exist");
                            }
                        }
                        else
                        {
                            return BadRequest("IHAC is Required");
                        }
                    }
                }
            }
            //Add Approval
            if (!app.reqStatusMessage.ToLower().Equals("pending"))
                app.reqApprovedRole = WorkFlowRoles.FirstOrDefault() ?? Roles.FirstOrDefault() ?? app.reqApprovedRole;
            app.reqApprovedBy = MemberId;
            //app.createdDate = DateTime.Now;
            //app.createdBy = MemberId.ToString();
            _ihpocontext.IHPOApproval.Add(app);
            await _ihpocontext.SaveChangesAsync();

            var ihpoApprovalData = await _ihpocontext.IHPOApproval.Where(x => x.reqID == app.reqID).OrderBy(x => x.reqID).LastOrDefaultAsync();
            var ihpoData = await _ihpocontext.IHPO.Where(x => x.ID == app.reqID).FirstOrDefaultAsync();
            var ihpoPricing = await _ihpocontext.IHPOPricing.Where(x => x.reqID == app.reqID).FirstOrDefaultAsync();

            if (ihpoData != null)
            {
                var currentUserWorkflowLevel = _ihpocontext.IHPOWorkflowSteps.FirstOrDefault(x => Roles.Contains(OrgAccountId + "_" + x.stepRole));
                var typeid = _ihpocontext.CodeTypes.Where(x => x.description == StatusTemplate).FirstOrDefault()?.Id;
                var statusid = _ihpocontext.CodeValues.Where(x => x.CODE_TYPE_ID == typeid && x.value == app.reqStatusMessage).FirstOrDefault()?.Id;

                if (app.reqStatusMessage.ToLower().Equals("rejected"))
                {
                    ihpoData.workflowStepSeq = (ihpoData.workflowStepSeq > 1) ? ihpoData.workflowStepSeq - 1 : 0;
                    await _emailNotification.SendRejectedMail(ihpoData, MemberId, app.reqComment);
                }
                else if (app.selfApprove)
                {
                    ihpoData.workflowStepSeq = currentUserWorkflowLevel?.stepSeq - 1 ?? 1;
                }
                else
                {
                    var reqtotalprice = ihpoData.IHPOPricing.reqTotalPrice;
                    ihpoData.workflowStepSeq = currentUserWorkflowLevel?.stepSeq ?? 1;
                    var nextWorkFlowStepSeq = await _ihpocontext.IHPOWorkflowSteps.FirstOrDefaultAsync(x => x.stepSeq == ihpoData.workflowStepSeq + 1
                     && reqtotalprice >= x.stepLimit
                    && x.OrgAccountId == OrgAccountId);
                    if (nextWorkFlowStepSeq != null)
                    {
                        await _emailNotification.SendApprovalMail(ihpoData, MemberId, OrgAccountId, nextWorkFlowStepSeq.stepRole);
                    }
                    else
                    {
                        await _emailNotification.SendMailToUser(ihpoData, MemberId);
                    }
                }

                ihpoData.status = statusid;
                var nextWorkFlowStep = await _ihpocontext.IHPOWorkflowSteps.Where(x => x.stepSeq == ihpoData.workflowStepSeq + 1).FirstOrDefaultAsync();
                if (nextWorkFlowStep is null)
                {
                    ihpoData.status = _ihpocontext.CodeValues.Where(x => x.CODE_TYPE_ID == typeid && x.value == "Completed").FirstOrDefault()?.Id;
                }
                /* IHPO status message column need ot update here */
                if (currentUserWorkflowLevel != null && currentUserWorkflowLevel.stepSeq != 1)
                {
                    ihpoData.statusMessage = currentUserWorkflowLevel.stepRole + " " + app.reqStatusMessage;
                }
                else
                {
                    ihpoData.statusMessage = "Sent For Approval";
                }
                //ihpoData.createdDate = ihpoData.createdDate;
                //ihpoData.createdBy = ihpoData.createdBy;
                _ihpocontext.IHPO.Update(ihpoData);
                await _ihpocontext.SaveChangesAsync();

                bool isWorkflowEmailEnabled = Convert.ToBoolean(_configuration["Features:WorkFlowEmail"]);

                if (isWorkflowEmailEnabled && !string.IsNullOrEmpty(app.reqStatusMessage))
                {
                    /* var email = new IHPOWorkflowEmailMetaData
                    {
                        IhpoReqNumber = ihpoData.reqNumber,
                        pONumber = ihpoData.reqPONumber,
                        status = app.reqStatusMessage,
                        Role = app.reqApprovedRole,
                        SendTo = "harisherra1997.gmail.com",
                    };
                    _workflowEmail.SendEmail(email); */
                }
                if (currentUserWorkflowLevel != null)
                {
                    _ihpocontext.IHPOWorkflowSteps.Entry(currentUserWorkflowLevel).State = EntityState.Detached;
                }
            }
            /* if (ihpoData != null && ihpoPricing != null)
             {
                 var nextWorkFlowStep = await _ihpocontext.IHPOWorkflowSteps.Where(x => x.stepSeq == ihpoData.workflowStepSeq + 1).FirstOrDefaultAsync();

                 if (nextWorkFlowStep is null)
                 {
                     ihpoData.createdBy = ihpoData.createdBy;
                     ihpoData.createdDate = ihpoData.createdDate;
                     ih
                     _ihpocontext.IHPO.Update(ihpoData);
                     await _ihpocontext.SaveChangesAsync();
                 }
             }*/
            return Ok(app);
        }

        [Route("IHPOToPO")]
        [HttpPost]
        public async Task<ActionResult<IHPO>> AssignIHPOToPO(IHPO ihpo)
        {
            var data = _ihpocontext.IHPO.Where(x => x.ID == ihpo.ID && x.OrgAccountId == OrgAccountId).FirstOrDefault();
            if (data == null)
            {
                return BadRequest("IHPO does not exist");
            }
            else
            {
                ihpo.OrgAccountId = OrgAccountId;
                ihpo.modifiedDate = DateTime.Now;
                _ihpocontext.IHPO.Update(ihpo);
                await _ihpocontext.SaveChangesAsync();
            }
            return Ok(ihpo);
        }

        [HttpGet("VoucherIHPO/{poId}")]
        public async Task<ActionResult<IEnumerable<IHPO>>> VoucherIHPO(int poId, bool desc, string sortKey = "ModifiedDate", int? skip = null, int? pageCount = null)
        {
            var total = 0;

            if (skip != null && pageCount != null)
            {
                var query = await _ihpocontext.IHPO.Include(x => x.IHPODetails)
                                                  .Include(x => x.IHPOPricing)
                                                  .Include(x => x.IHPODetails.Vendor)
                                                  .Include(x => x.CodeValues)
                                                  .Include(x => x.IHPOWorkflowStep)
                                                  .Include(x => x.IHPOLineItem).
               Where(x => x.reqPOid == poId && x.OrgAccountId == OrgAccountId)
                                         .Select(x => new
                                         {
                                             x.ID,
                                             x.reqNumber,
                                             x.IHPOPricing.reqBalance,
                                             x.IHPODetails.Vendor.name
                                         }).Skip(skip.Value).Take(pageCount.Value)
                                 .AsNoTracking().OrderByCustom(sortKey, desc).ToListAsync();
                return Ok(new { query, total });
            }
            else
            {
                var query = await _ihpocontext.IHPO.Include(x => x.IHPODetails)
                                                 .Include(x => x.IHPOPricing)
                                                 .Include(x => x.IHPODetails.Vendor)
                                                 .Include(x => x.CodeValues)
                                                 .Include(x => x.IHPOWorkflowStep)
                                                 .Include(x => x.IHPOLineItem).
              Where(x => x.reqPOid == poId && x.OrgAccountId == OrgAccountId)
                                        .Select(x => new
                                        {
                                            x.ID,
                                            x.reqNumber,
                                            x.IHPOPricing.reqBalance,
                                            x.IHPODetails.Vendor.name
                                        }).AsNoTracking().OrderByCustom(sortKey, desc).ToListAsync();
                return Ok(new { query, total });
            }

        }

        [HttpGet("IHPOBalance")]
        public async Task<ActionResult<decimal>> GetIHPOBalance(int ihpoId, decimal amount)
        {

            var voucherAmount = await _ihpocontext.vouchers.Where(x => x.ihpoId == ihpoId && x.OrgAccountId == OrgAccountId).SumAsync(x => x.voucherAmount);
            decimal balance = amount - (voucherAmount ?? 0);
            var recordPricing = await _ihpocontext.IHPO.Include(x => x.IHPOPricing).Where(x => x.ID == ihpoId && x.OrgAccountId == OrgAccountId)
                .Select(x => x.IHPOPricing).FirstOrDefaultAsync();
            recordPricing.reqBalance = balance;
            _ihpocontext.IHPOPricing.Update(recordPricing);
            await _ihpocontext.SaveChangesAsync();
            return balance;

        }

        [Route("OpenIHPO/{id}")]
        [HttpPut]
        public async Task<ActionResult<string>> OpenPO(int id)
        {
            var ihpo = await _ihpocontext.IHPO.FindAsync(id);
            if (ihpo == null)
            {
                BadRequest("IHPO does not exist");
            }
            ihpo.complete = false;
            ihpo.reqDateComplete = null;
            _ihpocontext.IHPO.Update(ihpo);
            await _ihpocontext.SaveChangesAsync();
            return Ok("IHPO Opened");
        }
        [Route("CloseIHPO/{id}")]
        [HttpPut]
        public async Task<ActionResult<string>> ClosePO(int id)
        {
            var ihpo = await _ihpocontext.IHPO.FindAsync(id);
            if (ihpo == null)
            {
                BadRequest("IHPO does not exist");
            }
            ihpo.complete = true;
            ihpo.reqDateComplete = DateTime.Now;
            _ihpocontext.IHPO.Update(ihpo);
            await _ihpocontext.SaveChangesAsync();
            return Ok("IHPO Closed");
        }

        [Route("ApproveAsSuperintendent/{id}")]
        [HttpPut]
        public async Task<ActionResult<string>> ApproveAsSuperintendent(int id)
        {

            var ihpo = await _ihpocontext.IHPO.FindAsync(id);
            if (ihpo == null)
            {
                BadRequest("IHPO does not exist");
            }
            //ihpo.complete = false;
            //ihpo.reqDateComplete = null;
            _ihpocontext.IHPO.Update(ihpo);
            await _ihpocontext.SaveChangesAsync();
            return Ok("IHPO ApproveAsSuperdent");
        }
    }
}
