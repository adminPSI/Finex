using FinexAPI.Data;
using FinexAPI.Models;
using FinexAPI.Models.IHPOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommonController : ControllerBase
    {
        private readonly FinexAppContext _commoncontext;
        public CommonController(FinexAppContext commonContext)
        {
            _commoncontext = commonContext;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CodeValues>>> GetCodes(int id)
        {
            return await _commoncontext.CodeValues.Include(x => x.CodeTypes).Where(x => x.CODE_TYPE_ID == id).OrderBy(x => x.value).ToListAsync();
        }
    }
}
