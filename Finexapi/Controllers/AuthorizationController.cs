using Azure.Core;
using FinexAPI.Data;
using FinexAPI.Models;
using FinexAPI.Models.UserManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using static System.Net.WebRequestMethods;
using static System.Runtime.InteropServices.JavaScript.JSType;


namespace FinexAPI.Controllers
{

    [Authorize]
    public class AuthorizationController : BaseController
    {
        private readonly UserManagementContext _userMngtContext;
        private readonly IMemoryCache _memoryCache;
        //private readonly UserManager<IdentityUser> _userManager;

        public AuthorizationController(IHttpContextAccessor httpContextAccessor, UserManagementContext userManagementContext, IMemoryCache memoryCache)
            : base(httpContextAccessor)
        {
            _userMngtContext = userManagementContext;
            _memoryCache = memoryCache;
            //_userManager = userManager;
        }

        [HttpGet("FunctionGroups")]
        public async Task<ActionResult<IEnumerable<FUNCTIONS_GROUPS>>> GetFunctionGroups()
        {

            return await _userMngtContext.FUNCTIONS_GROUPS.ToListAsync();
        }

        [HttpPost("FunctionGroups")]
        public async Task<ActionResult<FUNCTIONS_GROUPS>> CreateFunctionGroup([FromBody] FUNCTIONS_GROUPS request)
        {
            if (request == null) return BadRequest("Invalid request.");

            _userMngtContext.FUNCTIONS_GROUPS.Add(request);
            await _userMngtContext.SaveChangesAsync();

            return request;
        }

        [HttpGet("Functions")]
        public async Task<ActionResult<IEnumerable<FUNCTIONS>>> GetFunctions()
        {

            return await _userMngtContext.FUNCTIONS.ToListAsync();
        }

        [HttpPost("Functions")]
        public async Task<ActionResult<FUNCTIONS>> CreateFunction([FromBody] FUNCTIONS request)
        {
            if (request == null) return BadRequest("Invalid request.");



            _userMngtContext.FUNCTIONS.Add(request);
            await _userMngtContext.SaveChangesAsync();

            return request;
        }

        [HttpGet("Privileges")]
        public async Task<ActionResult<IEnumerable<PRIVILEGES>>> GetPrivileges()
        {

            return await _userMngtContext.PRIVILEGES.ToListAsync();
        }
        [HttpPost("Privileges")]
        public async Task<ActionResult<PRIVILEGES>> CreatePrivilege([FromBody] PRIVILEGES request)
        {
            if (request == null) return BadRequest("Invalid request.");


            _userMngtContext.PRIVILEGES.Add(request);


            await _userMngtContext.SaveChangesAsync();

            return request;
        }

        [HttpGet("Resources")]
        public async Task<ActionResult<IEnumerable<RESOURCES>>> GetResources()
        {

            return await _userMngtContext.RESOURCES.ToListAsync();
        }

        [HttpPost("Resources")]
        public async Task<ActionResult<RESOURCES>> CreateResources([FromBody] RESOURCES request)
        {
            if (request == null) return BadRequest("Invalid request.");


            _userMngtContext.RESOURCES.Add(request);


            await _userMngtContext.SaveChangesAsync();

            return request;
        }


        [HttpGet]
        [Route("GetMenuList")]
        public async Task<ActionResult> GetMenuList()
        {
            try
            {
                var roleList = Roles;
                var roleIds = _userMngtContext.ROLE.Where(o => roleList.Contains(o.ROLES_NAME)).Select(x => x.ROLE_ID).ToList();
                var role_resource = (from fpr in _userMngtContext.FUNCTION_PRIVILEGE_ROLE
                                     join f in _userMngtContext.FUNCTIONS on fpr.FUNCTION_ID equals f.FUNCTIONS_ID into f_fpr
                                     from ffpr in f_fpr.DefaultIfEmpty()
                                     join fr in _userMngtContext.FUNCTIONS_RESOURCES on ffpr.FUNCTIONS_ID equals fr.FUNCTIONS_ID into ffpr_fr
                                     from ffprfr in ffpr_fr.DefaultIfEmpty()
                                     join r in _userMngtContext.RESOURCES on ffprfr.RESOURCES_ID equals r.RESOURCES_ID into ffprfr_r
                                     from ffprfrr in ffprfr_r.DefaultIfEmpty()
                                     where (roleIds.Contains(fpr.ROLE_ID)) && (ffprfrr.RESOURCES_TYPE == "Menu")
                                     select Convert.ToInt32(ffprfr.RESOURCES_ID)
                                           ).ToList();

                var resources = _userMngtContext.RESOURCES.Where(x => role_resource.Contains(x.RESOURCES_ID)).ToList();


                List<dynamic?> menus = new List<dynamic?>();
                foreach (var lvl1 in resources.Where(x => x.RESOURCES_LEVEL == "Level1").ToList())
                {
                    dynamic objl1 = new System.Dynamic.ExpandoObject();
                    objl1.MenuTitle = lvl1.RESOURCES_NAME;
                    objl1.ChildMenus = new List<dynamic?>();

                    foreach (var lvl2 in resources.Where(x => x.RESOURCES_LEVEL == "Level2" && x.PARENT_RESOURCES_ID == lvl1.RESOURCES_ID).ToList())
                    {
                        dynamic objl2 = new System.Dynamic.ExpandoObject();
                        objl2.MenuTitle = lvl2.RESOURCES_NAME;
                        objl2.ChildMenus = new List<dynamic?>();
                        foreach (var lvl3 in resources.Where(x => x.RESOURCES_LEVEL == "Level3" && x.PARENT_RESOURCES_ID == lvl2.RESOURCES_ID).ToList())
                        {
                            dynamic objl3 = new System.Dynamic.ExpandoObject();
                            objl3.MenuTitle = lvl3.RESOURCES_NAME;
                            objl3.Url = lvl3.RESOURCES_URI;
                            objl3.ResourceId = lvl3.RESOURCES_ID;
                            objl3.Icon = lvl3.ICON;
                            objl3.ChildMenus = new List<dynamic?>();
                            if (objl3.ChildMenus.Count == 0)
                            {
                                objl3.ChildMenus = null;
                            }
                            objl2.ChildMenus.Add(objl3);
                        }
                        if (objl2.ChildMenus.Count == 0)
                        {
                            objl2.ChildMenus = null;
                        }
                        objl1.ChildMenus.Add(objl2);

                    }
                    if (objl1.ChildMenus.Count == 0)
                    {
                        objl1.ChildMenus = null;
                    }
                    menus.Add(objl1);
                }
                return Ok(menus);
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        [HttpGet]
        [Route("GetPrivileges")]
        public async Task<ActionResult> GetPrivileges(string resourceKey, int? privilegesId)
        {
            try
            {
                List<PRIVILEGES> privileges = new List<PRIVILEGES>();
                //var userId = MemberId;
                //var RoleList = Roles;
                if (string.IsNullOrEmpty(resourceKey))
                {
                    return BadRequest("resourceName is required");
                }
                //var user = await _userManager.Users.FirstOrDefaultAsync(o => o.Id == "a0dab310-968c-40bd-b14a-ee676e4098a3");
                var roleList = Roles;
                var roleIds = _userMngtContext.ROLE.Where(o => roleList.Contains(o.ROLES_NAME)).Select(x => x.ROLE_ID).ToList();

                var resourceId = _userMngtContext.RESOURCES?.Where(o => o.RESOURCES_KEY.ToLower() == resourceKey.ToLower()).FirstOrDefault()?.RESOURCES_ID ?? 0;
                var role_resource = _userMngtContext.ROLE_RESOURCES.Where(x => x.ROLE_ID.HasValue && roleIds.Contains(x.ROLE_ID.Value) && x.RESOURCES_ID == resourceId &&
                (privilegesId == x.PRIVILEGES_ID || string.IsNullOrEmpty(privilegesId.ToString()))).Select(y => y.PRIVILEGES_ID).ToList();

                privileges = _userMngtContext.PRIVILEGES.Where(x => role_resource.Contains(x.privileges_id)).ToList();


                return Ok(privileges);

            }
            catch (Exception ex)
            {

                throw;
            }

        }

        [HttpGet]
        [Route("GetPrivilegesByFunctionGroupName")]
        public async Task<ActionResult> GetPrivilegesByFunctionGroupName(string functionGroupName)
        {
            try
            {
                List<PRIVILEGES> privileges = new List<PRIVILEGES>();

                if (string.IsNullOrEmpty(functionGroupName))
                {
                    return BadRequest("functionGroupName is required");
                }
                var roleList = Roles;
                var roleIds = _userMngtContext.ROLE.Where(o => roleList.Contains(o.ROLES_NAME)).Select(x => x.ROLE_ID).ToList();
                var functionGroupsId = _userMngtContext.FUNCTIONS_GROUPS?.Where(o => o.FUNCTION_GROUPS_NAME.Trim().ToLower().Contains(functionGroupName.Trim().ToLower())).Select(x => x.FUNCTIONS_GROUPS_ID).ToList();
                var functionId = _userMngtContext.FUNCTIONS?.Where(o => o.FUNCTIONS_GROUPS_ID.HasValue && functionGroupsId.Contains(o.FUNCTIONS_GROUPS_ID.Value)).Select(x => x.FUNCTIONS_ID).ToList();

                var functionResourseId = _userMngtContext.FUNCTIONS_RESOURCES?.Where(o => o.FUNCTIONS_ID.HasValue && functionId.Contains(o.FUNCTIONS_ID.Value)).Select(x => x.RESOURCES_ID).ToList();

                //_userMngtContext.FUNCTION_PRIVILEGE_ROLE.Where(f=> roleIds.Contains(f.ROLE_ID)).Select(a=>a.FUNCTION_PRIVILEGE_ROLE_ID).ToList();

                //var resList = (from res in _userMngtContext.RESOURCES
                //               join role in _userMngtContext.ROLE_RESOURCES on res.RESOURCES_ID equals role.RESOURCES_ID into rolesRes
                //               from rol in rolesRes.DefaultIfEmpty()
                //               join pri in _userMngtContext.PRIVILEGES on rol.PRIVILEGES_ID equals pri.privileges_id into privilegesRes
                //               from pr in privilegesRes.DefaultIfEmpty()
                //               where (rol.ROLE_ID.HasValue && roleIds.Contains(rol.ROLE_ID.Value))
                //               && (rol.RESOURCES_ID.HasValue && functionResourseId.Contains(rol.RESOURCES_ID.Value))
                //               select new
                //               {
                //                   resources_id = res.RESOURCES_ID,
                //                   resources_key = res.RESOURCES_KEY,
                //                   privileges_id = pr.privileges_id,
                //               }).ToList();


                var resList = (from fpr in _userMngtContext.FUNCTION_PRIVILEGE_ROLE
                               join f in _userMngtContext.FUNCTIONS on fpr.FUNCTION_ID equals f.FUNCTIONS_ID into f_fpr
                               from ffpr in f_fpr.DefaultIfEmpty()
                               join fr in _userMngtContext.FUNCTIONS_RESOURCES on ffpr.FUNCTIONS_ID equals fr.FUNCTIONS_ID into ffpr_fr
                               from ffprfr in ffpr_fr.DefaultIfEmpty()
                               join r in _userMngtContext.RESOURCES on ffprfr.RESOURCES_ID equals r.RESOURCES_ID into ffprfr_r
                               from ffprfrr in ffprfr_r.DefaultIfEmpty()
                               where (roleIds.Contains(fpr.ROLE_ID)) && (functionResourseId.Contains(ffprfrr.RESOURCES_ID))
                               select new
                               {
                                   resources_id = ffprfrr.RESOURCES_ID,
                                   resources_key = ffprfrr.RESOURCES_KEY,
                                   privileges_id = fpr.PRIVILEGES_ID,
                               }
                                           ).ToList();

                return Ok(resList);

            }
            catch (Exception ex)
            {

                throw;
            }

        }


        /* [HttpGet]
         [Route("GetSecurityPermission")]
         public   GetSecurityPermission()
         {


             return null;
         }*/


        [HttpGet("GetFunctionGroupsTree")]
        public async Task<IActionResult> GetFunctionGroupsTree()
        {
            try
            {
                // Step 1: Preload Data
                var roles = await _userMngtContext.ROLE
                    .Where(r => r.ORG_ACCOUNT_ID == OrgAccountId)
                    .Select(r => new { r.ROLE_ID, r.ROLES_NAME })
                    .ToListAsync();

                var roleIds = roles.Select(r => r.ROLE_ID).ToList();

                var validFunctionRoles = await _userMngtContext.FUNCTION_PRIVILEGE_ROLE
                    .Where(fpr => roleIds.Contains(fpr.ROLE_ID))
                    .ToListAsync();

                var privileges = await _userMngtContext.FUNCTION_ALLOWED_PRIVILEGES.ToListAsync();

                var functions = await _userMngtContext.FUNCTIONS.ToListAsync();

                var functionGroups = await _userMngtContext.FUNCTIONS_GROUPS.Where(fg => fg.APPLICATIONS_ID == 1).ToListAsync();

                // Step 2: Build the hierarchy manually
                var result = functionGroups
                    .Where(fg => fg.PARENT_FUNCTION_GROUPS_ID == 0) // Root groups
                    .Select(fg => new
                    {
                        FunctionGroupId = fg.FUNCTIONS_GROUPS_ID,
                        FunctionGroupName = fg.FUNCTION_GROUPS_NAME,

                        ChildFunctionGroups = functionGroups
                            .Where(child => child.PARENT_FUNCTION_GROUPS_ID == fg.FUNCTIONS_GROUPS_ID)
                            .Select(child => new
                            {
                                FunctionGroupId = child.FUNCTIONS_GROUPS_ID,
                                FunctionGroupName = child.FUNCTION_GROUPS_NAME,

                                Functions = functions
                                    .Where(f => f.FUNCTIONS_GROUPS_ID == child.FUNCTIONS_GROUPS_ID)
                                    .Select(f => new
                                    {
                                        FunctionId = f.FUNCTIONS_ID,
                                        FunctionName = f.FUNCTIONS_NAME,

                                        AllowedPrivileges = privileges
                                            .Where(ap => ap.FUNCTION_ID == f.FUNCTIONS_ID)
                                            .Select(ap => new
                                            {
                                                PrivilegeId = ap.PRIVILEGES_ID,

                                                Roles = validFunctionRoles
                                                    .Where(vfr => vfr.FUNCTION_ID == ap.FUNCTION_ID && vfr.PRIVILEGES_ID == ap.PRIVILEGES_ID)
                                                    .Select(vfr => new
                                                    {
                                                        RoleId = vfr.ROLE_ID,
                                                        RoleName = roles.FirstOrDefault(r => r.ROLE_ID == vfr.ROLE_ID)?.ROLES_NAME
                                                    }).ToList()
                                            })
                                            .ToList()
                                    })
                                    .ToList()
                            })
                            .ToList()
                    }).ToList();

                return Ok(result);
            }
            catch (Exception ex) { throw ex; }
        }

        [Route("LogOut")]
        [HttpPost]
        public async Task<ActionResult<string>> LogOut()
        {
            if (_memoryCache is MemoryCache concreteMemoryCache)
            {
                concreteMemoryCache.Clear();
            }
            return Ok();
        }


        [HttpPut("FunctionResourcePrivilege")]
        public async Task<IActionResult> UpdateFunctionResourcePrivilege([FromBody] FunctionPrivilegeRoleStatusWise functionPrivilegeRoleStatusWise)
        {
            List<FUNCTION_PRIVILEGE_ROLE> _PRIVILEGE_ROLEs = new List<FUNCTION_PRIVILEGE_ROLE>();
            functionPrivilegeRoleStatusWise.functionPrivilegeRoles.ForEach(record =>
            {
                var role = _userMngtContext.ROLE.Where(a => a.ROLES_NAME.ToLower() == OrgAccountId.ToString() + "_" + record.ROLE_NAME.ToLower()).FirstOrDefault();
                if (role != null)
                {
                    var roleId = role.ROLE_ID;
                    record.ROLE_ID = roleId;

                    FUNCTION_PRIVILEGE_ROLE _PRIVILEGE_ROLE = new FUNCTION_PRIVILEGE_ROLE();
                    _PRIVILEGE_ROLE.ROLE_ID = roleId;
                    _PRIVILEGE_ROLE.PRIVILEGES_ID = record.PRIVILEGES_ID;
                    _PRIVILEGE_ROLE.FUNCTION_ID = record.FUNCTION_ID;
                    _PRIVILEGE_ROLEs.Add(_PRIVILEGE_ROLE);

                    var existingMappings = _userMngtContext.FUNCTION_PRIVILEGE_ROLE

            .Where(fr => fr.FUNCTION_ID == record.FUNCTION_ID && fr.ROLE_ID == roleId).ToList();
                    _userMngtContext.FUNCTION_PRIVILEGE_ROLE.RemoveRange(existingMappings);
                }
            });



            functionPrivilegeRoleStatusWise.inactivefunctionPrivilegeRoles.ForEach(record =>
            {
                var role = _userMngtContext.ROLE.Where(a => a.ROLES_NAME.ToLower() == OrgAccountId.ToString() + "_" + record.ROLE_NAME.ToLower()).FirstOrDefault();
                if (role != null)
                {
                    var roleId = role.ROLE_ID;
                    record.ROLE_ID = roleId;
                    var existingMappings = _userMngtContext.FUNCTION_PRIVILEGE_ROLE
                .Where(fr => fr.FUNCTION_ID == record.FUNCTION_ID && fr.ROLE_ID == roleId).ToList();
                    _userMngtContext.FUNCTION_PRIVILEGE_ROLE.RemoveRange(existingMappings);
                }
            });
            _userMngtContext.FUNCTION_PRIVILEGE_ROLE.AddRange(_PRIVILEGE_ROLEs);
            await _userMngtContext.SaveChangesAsync();

            return Ok(new { Message = "Mapping updated successfully." });
        }



        [HttpDelete("FunctionResourcePrivilege")]
        public async Task<IActionResult> DeleteFunctionResourcePrivilege([FromBody] List<FUNCTION_PRIVILEGE_ROLE_LOOKUP> functionPrivilegeRoles)
        {
            List<FUNCTION_PRIVILEGE_ROLE> _PRIVILEGE_ROLEs = new List<FUNCTION_PRIVILEGE_ROLE>();
            functionPrivilegeRoles.ForEach(record =>
            {
                var roleId = _userMngtContext.ROLE.Where(a => a.ROLES_NAME.ToLower() == OrgAccountId.ToString() + "_" + record.ROLE_NAME.ToLower()).FirstOrDefault().ROLE_ID;
                record.ROLE_ID = roleId;

                FUNCTION_PRIVILEGE_ROLE _PRIVILEGE_ROLE = new FUNCTION_PRIVILEGE_ROLE();
                _PRIVILEGE_ROLE.ROLE_ID = roleId;
                _PRIVILEGE_ROLE.PRIVILEGES_ID = record.PRIVILEGES_ID;
                _PRIVILEGE_ROLE.FUNCTION_ID = record.FUNCTION_ID;
                _PRIVILEGE_ROLEs.Add(_PRIVILEGE_ROLE);

                var existingMappings = _userMngtContext.FUNCTION_PRIVILEGE_ROLE
            .Where(fr => fr.FUNCTION_ID == record.FUNCTION_ID && fr.ROLE_ID == roleId).ToList();
                _userMngtContext.FUNCTION_PRIVILEGE_ROLE.RemoveRange(existingMappings);
            });
            await _userMngtContext.SaveChangesAsync();

            return Ok(new { Message = "Mappings deleted successfully." });
        }


        /*
         



                [HttpDelete("RemoveFunctionResourcePrivilege")]
                public async Task<IActionResult> RemoveFunctionResourcePrivilege(int functionId, int resourceId, int privilegeId)
                {
                    // Find the mapping
                    var mapping = await _userMngtContext.FUNCTION_RESOURCE_PRIVILEGES
                        .FirstOrDefaultAsync(frp => frp.FUNCTION_ID == functionId &&
                                                    frp.RESOURCES_ID == resourceId &&
                                                    frp.PRIVILEGES_ID == privilegeId);

                    if (mapping == null)
                        return NotFound(new { Message = "Mapping not found." });

                    // Remove the mapping
                    _userMngtContext.FUNCTION_RESOURCE_PRIVILEGES.Remove(mapping);
                    await _userMngtContext.SaveChangesAsync();

                    return Ok(new { Message = "Mapping removed successfully." });
                }

                */


        [HttpGet("FunctionsResources/{functionId}")]
        public async Task<IActionResult> GetFunctionsResources(int functionId)
        {

            var functionResourcePrivileges = await _userMngtContext.FUNCTIONS
            .Where(f => f.FUNCTIONS_ID == functionId)
            .Join(
                _userMngtContext.FUNCTIONS_RESOURCES,
                f => f.FUNCTIONS_ID,
                frp => frp.FUNCTIONS_ID,
                (f, frp) => new
                {
                    f.FUNCTIONS_ID,
                    f.FUNCTIONS_NAME,
                    frp.RESOURCES_ID,
                    frp.PRIVILEGE_ID
                })
            .Join(
                _userMngtContext.RESOURCES,
                combined => combined.RESOURCES_ID,
                r => r.RESOURCES_ID,
                (combined, r) => new
                {
                    combined.FUNCTIONS_ID,
                    combined.FUNCTIONS_NAME,
                    r.RESOURCES_ID,
                    r.RESOURCES_NAME,
                    combined.PRIVILEGE_ID
                })
            .Join(
                _userMngtContext.PRIVILEGES,
                combined => combined.PRIVILEGE_ID,
                p => p.privileges_id,
                (combined, p) => new
                {
                    FunctionId = combined.FUNCTIONS_ID,
                    FunctionName = combined.FUNCTIONS_NAME,
                    ResourceId = combined.RESOURCES_ID,
                    ResourceName = combined.RESOURCES_NAME,
                    PrivilegeId = p.privileges_id,
                    PrivilegeName = p.privileges_name
                })
            .ToListAsync();
            if (functionResourcePrivileges == null)
                return NotFound(new { Message = "Function not found" });

            return Ok(functionResourcePrivileges);
        }



        [HttpGet("FunctionsResources")]
        public async Task<IActionResult> GetAllFunctionsResourcesPrivileges()
        {

            // Perform a join between FUNCTIONS, FUNCTION_RESOURCE_PRIVILEGES, RESOURCES, and PRIVILEGES
            var functionResourcePrivileges = await _userMngtContext.FUNCTIONS
                .Join(
                    _userMngtContext.FUNCTIONS_RESOURCES,
                    f => f.FUNCTIONS_ID,
                    frp => frp.FUNCTIONS_ID,
                    (f, frp) => new
                    {
                        f.FUNCTIONS_ID,
                        f.FUNCTIONS_NAME,
                        frp.RESOURCES_ID,
                        frp.PRIVILEGE_ID
                    })
                .Join(
                    _userMngtContext.RESOURCES,
                    combined => combined.RESOURCES_ID,
                    r => r.RESOURCES_ID,
                    (combined, r) => new
                    {
                        combined.FUNCTIONS_ID,
                        combined.FUNCTIONS_NAME,
                        r.RESOURCES_ID,
                        r.RESOURCES_NAME,
                        combined.PRIVILEGE_ID
                    })
                .Join(
                    _userMngtContext.PRIVILEGES,
                    combined => combined.PRIVILEGE_ID,
                    p => p.privileges_id,
                    (combined, p) => new
                    {
                        FunctionId = combined.FUNCTIONS_ID,
                        FunctionName = combined.FUNCTIONS_NAME,
                        ResourceId = combined.RESOURCES_ID,
                        ResourceName = combined.RESOURCES_NAME,
                        PrivilegeId = p.privileges_id,
                        PrivilegeName = p.privileges_name
                    })
                .ToListAsync();

            // Group by FunctionId to structure the output
            var result = functionResourcePrivileges
                .GroupBy(frp => new { frp.FunctionId, frp.FunctionName })
                .Select(group => new
                {
                    FunctionId = group.Key.FunctionId,
                    FunctionName = group.Key.FunctionName,
                    ResourcesAndPrivileges = group.Select(frp => new
                    {
                        ResourceId = frp.ResourceId,
                        ResourceName = frp.ResourceName,
                        PrivilegeId = frp.PrivilegeId,
                        PrivilegeName = frp.PrivilegeName
                    }).ToList()
                })
                .ToList();

            return Ok(result);

        }



        [HttpGet("FunctionsWithAllowedPrivileges")]
        public async Task<IActionResult> GetAllFunctionsWithAllowedPrivileges()
        {
            // Fetch all functions
            var functions = await _userMngtContext.FUNCTIONS
                .Select(f => new
                {
                    FunctionId = f.FUNCTIONS_ID,
                    FunctionName = f.FUNCTIONS_NAME
                })
                .ToListAsync();

            // Loop through each function and attach associated privileges
            var result = functions.Select(f => new
            {
                FunctionId = f.FunctionId,
                FunctionName = f.FunctionName,
                AssociatedPrivileges = _userMngtContext.FUNCTION_ALLOWED_PRIVILEGES
                    .Where(ap => ap.FUNCTION_ID == f.FunctionId)
                    .Select(ap => new
                    {
                        PrivilegeId = ap.PRIVILEGES_ID,
                        PrivilegeName = _userMngtContext.PRIVILEGES
                            .Where(p => p.privileges_id == ap.PRIVILEGES_ID)
                            .Select(p => p.privileges_name)
                            .FirstOrDefault()
                    })
                    .ToList() // Fetch privileges as a list
            }).ToList();

            return Ok(result);
        }

        [HttpPost("FunctionWithAllowedPrivileges/{functionId}")]
        public async Task<IActionResult> AddFunctionWithAllowedPrivileges(int FunctionId, List<int> PrivilegeIds)
        {
            if (FunctionId <= 0 || PrivilegeIds == null)
                return BadRequest(new { Message = "Invalid request" });

            // Remove existing privileges for the function
            var existingPrivileges = _userMngtContext.FUNCTION_ALLOWED_PRIVILEGES
                .Where(ap => ap.FUNCTION_ID == FunctionId);
            _userMngtContext.FUNCTION_ALLOWED_PRIVILEGES.RemoveRange(existingPrivileges);
            await _userMngtContext.SaveChangesAsync();

            // Add new privileges for the function
            var newPrivileges = PrivilegeIds
                .Select(privilegeId => new FUNCTION_ALLOWED_PRIVILEGES
                {
                    FUNCTION_ID = FunctionId,
                    PRIVILEGES_ID = privilegeId
                }).ToList();

            _userMngtContext.FUNCTION_ALLOWED_PRIVILEGES.AddRange(newPrivileges);
            await _userMngtContext.SaveChangesAsync();

            return Ok(new { Message = "Privileges Added successfully" });
        }

        [HttpGet("FunctionWithAllowedPrivileges/{functionId}")]
        public async Task<IActionResult> GetFunctionWithAllowedPrivileges(int functionId)
        {
            // Fetch the function
            var function = await _userMngtContext.FUNCTIONS
                .Where(f => f.FUNCTIONS_ID == functionId)
                .Select(f => new
                {
                    FunctionId = f.FUNCTIONS_ID,
                    FunctionName = f.FUNCTIONS_NAME,
                    AllowedPrivileges = _userMngtContext.FUNCTION_ALLOWED_PRIVILEGES
                        .Where(ap => ap.FUNCTION_ID == f.FUNCTIONS_ID)
                        .Select(ap => new
                        {
                            PrivilegeId = ap.PRIVILEGES_ID,
                            PrivilegeName = _userMngtContext.PRIVILEGES
                                .Where(p => p.privileges_id == ap.PRIVILEGES_ID)
                                .Select(p => p.privileges_name)
                                .FirstOrDefault()
                        }).ToList()
                })
                .FirstOrDefaultAsync();

            if (function == null)
                return NotFound(new { Message = "Function not found" });

            return Ok(function);
        }




    }




}
