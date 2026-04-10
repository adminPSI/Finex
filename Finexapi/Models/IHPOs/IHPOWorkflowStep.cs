using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinexAPI.Models.IHPOs
{
    [Table("IHPO_WORKFLOW_STEPS")]
    public class IHPOWorkflowStep
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }
        [Column("WorkflowId")]
        public int WorkflowId { get; set; }

        [Column("StepName")]
        public string workflowStepName { get; set; }

        [Column("stepSeq")]
        public int stepSeq { get; set; }

        [Column("StepStatus")]
        public string stepStatus { get; set; }

        [Column("stepRole")]
        public string stepRole { get; set; }
        [Column("ORG_ACCOUNT_ID")]
        [JsonPropertyName("orgAccountId")]
        public int? OrgAccountId { set; get; }
        [Column("STEP_LIMIT")]
        public decimal? stepLimit { get; set; }

        public List<IHPO> IHPOs { get; set; }
    }
}
