namespace FinexAPI.Rules
{
    public class TimeCardRules
    {
        public string SevenMinuteRule(string WhatTime)
        {
            // Return "00:00" if WhatTime is not a valid date/time.
            if (!DateTime.TryParse(WhatTime, out DateTime dt))
                return "00:00";

            // Create a temporary time string with hour "08" and the minutes from WhatTime.
            string tTime = "08:" + DateTime.Parse(WhatTime).ToString("mm");

            // If the minutes (last two characters of tTime) are >= 53, set hour to "07".
            if (int.Parse(tTime.Substring(tTime.Length - 2)) >= 53)
            {
                tTime = "07:" + DateTime.Parse(WhatTime).ToString("mm");
            }

            // Convert WhatTime to "HH:mm" format.
            WhatTime = DateTime.Parse(WhatTime).ToString("HH:mm");

            // Parse tTime and WhatTime so that we can compare their TimeOfDay components.
            DateTime parsedTTime = DateTime.Parse(tTime);
            DateTime parsedWhatTime = DateTime.Parse(WhatTime);

            // Determine the adjusted time based on the rules.
            if (parsedTTime.TimeOfDay >= new TimeSpan(7, 53, 0) && parsedTTime.TimeOfDay <= new TimeSpan(7, 59, 0))
            {
                if (parsedTTime.AddHours(1) > DateTime.Parse("8:00 AM"))
                {
                    WhatTime = parsedWhatTime.AddHours(1).ToString("HH") + ":00";
                }
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 0, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 7, 0))
            {
                if (parsedTTime.AddHours(1) > DateTime.Parse("8:00 AM"))
                {
                    WhatTime = WhatTime.Substring(0, 2) + ":00";
                }
                else
                {
                    WhatTime = parsedWhatTime.AddHours(1).ToString("HH").Substring(0, 2) + ":00";
                }
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 8, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 22, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":15";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 23, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 37, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":30";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 38, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 52, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":45";
            }

            // Return the adjusted time formatted as "h:mm tt" (e.g. "8:00 AM").
            return DateTime.Parse(WhatTime).ToString("h:mm tt");
        }

        public string ThreeMinuteRule(string WhatTime)
        {
            if (!DateTime.TryParse(WhatTime, out DateTime dt))
                return "00:00";

            string tTime = "08:" + DateTime.Parse(WhatTime).ToString("mm");
            if (int.Parse(tTime.Substring(tTime.Length - 2)) >= 53)
            {
                tTime = "07:" + DateTime.Parse(WhatTime).ToString("mm");
            }
            WhatTime = DateTime.Parse(WhatTime).ToString("HH:mm");

            DateTime parsedTTime = DateTime.Parse(tTime);
            DateTime parsedWhatTime = DateTime.Parse(WhatTime);

            if (parsedTTime.TimeOfDay >= new TimeSpan(7, 57, 0) && parsedTTime.TimeOfDay <= new TimeSpan(7, 59, 0))
            {
                if (parsedTTime.AddHours(1) > DateTime.Parse("8:00 AM"))
                {
                    WhatTime = parsedWhatTime.AddHours(1).ToString("HH") + ":00";
                }
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 0, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 2, 0))
            {
                if (parsedTTime.AddHours(1) > DateTime.Parse("8:00 AM"))
                {
                    WhatTime = WhatTime.Substring(0, 2) + ":00";
                }
                else
                {
                    WhatTime = parsedWhatTime.AddHours(1).ToString("HH").Substring(0, 2) + ":00";
                }
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 3, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 8, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":06";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 9, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 14, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":12";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 15, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 20, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":18";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 21, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 26, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":24";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 27, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 32, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":30";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 33, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 38, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":36";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 39, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 44, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":42";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 45, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 50, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":48";
            }
            else if (parsedTTime.TimeOfDay >= new TimeSpan(8, 51, 0) && parsedTTime.TimeOfDay <= new TimeSpan(8, 56, 0))
            {
                WhatTime = WhatTime.Substring(0, 2) + ":54";
            }

            return DateTime.Parse(WhatTime).ToString("h:mm tt");
        }
    }
}
