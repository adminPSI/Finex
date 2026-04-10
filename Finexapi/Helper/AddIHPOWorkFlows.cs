using FinexAPI.Data;
using FinexAPI.Models.IHPOs;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Helper
{
    public class AddIHPOWorkFlows
    {
        public static async Task<string> AddIHPOWorkFlow(FinexAppContext iHPOContext, int orgAccountId)
        {
            string sql = "Insert into IHPO_WORKFLOW_STEPS (WorkflowId,StepName,StepSeq,StepStatus,StepRole,ORG_ACCOUNT_ID,STEP_LIMIT) select WorkflowId,StepName,StepSeq,StepStatus,StepRole," + orgAccountId + ",STEP_LIMIT from IHPO_WORKFLOW_STEPS where isnull(ORG_ACCOUNT_ID,0)=0";
            var result = await iHPOContext.Database.ExecuteSqlRawAsync(sql);
            return result.ToString();
        }
    }
}
