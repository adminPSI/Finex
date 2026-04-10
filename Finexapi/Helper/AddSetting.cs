using FinexAPI.Data;
using FinexAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Helper
{
    public class AddSetting
    {
        public static async Task<string> AddSettingValues(FinexAppContext context, int orgAccountId)
        {
            var settingValues = new List<SettingsValue>
            {
                new SettingsValue{settingsId = 20,settingValue="1",OrgAccountId=orgAccountId},
                new SettingsValue{settingsId = 22,settingValue="1",OrgAccountId=orgAccountId},
            };

            context.SettingsValue.AddRange(settingValues);
            await context.SaveChangesAsync();
            return "Settings Added";
        }
    }
}
