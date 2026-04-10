using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListResultController<T> : ControllerBase
    {

        public OkObjectResult returnResponse(int take, int skip, List<T> data, decimal dayTapeAmount = 0)
        {
            if (typeof(T).Name.ToString() == "CountyRevenue")
            {
                if (take == 0)
                {
                    return Ok(new { data = data, Total = data.Count, dayTapeAmount = dayTapeAmount });
                }
                else
                {
                    return Ok(new { data = data.Skip(skip).Take(take).ToList(), Total = data.Count, dayTapeAmount = dayTapeAmount });

                }
            }
            else
            {
                if (take == 0)
                {
                    return Ok(new { data = data, Total = data.Count });
                }
                else
                {
                    return Ok(new { data = data.Skip(skip).Take(take).ToList(), Total = data.Count });
                }
            }
        }

        public async Task<OkObjectResult> returnResponse(int take, int skip, IQueryable<T> data, decimal dayTapeAmount = 0)
        {
            //var totalCount = data.Count();
            if (typeof(T).Name.ToString() == "CountyRevenue")
            {
                if (take == 0)
                {
                    return Ok(new { data = await data.ToListAsync(), Total = await data.CountAsync(), dayTapeAmount = dayTapeAmount });
                }
                else
                {
                    return Ok(new { data = await data.Skip(skip).Take(take).ToListAsync(), Total = await data.CountAsync(), dayTapeAmount = dayTapeAmount });

                }
            }
            else
            {
                if (take == 0)
                {
                    return Ok(new { data = await data.ToListAsync(), Total = await data.CountAsync() });
                }
                else
                {
                    return Ok(new { data = await data.Skip(skip).Take(take).ToListAsync(), Total = await data.CountAsync() });
                }
            }
        }
    }
}
