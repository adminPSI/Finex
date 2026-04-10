using Newtonsoft.Json;

namespace FinexAPI.Common
{
    public static class ExtensionMethod
    {
        public static T DeepCopy<T>(this T self) { 
            var serialized= JsonConvert.SerializeObject(self);
            return JsonConvert.DeserializeObject<T>(serialized);
        }
    }
}
