using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore.Update;
using System.Globalization;

namespace FinexAPI.Helper
{
    public static class Sequence
    {
        public static long GetNextSequencevalue(this DbContext context, string name, string schema = null)
        {
            var dtY = DateTime.Now.Year.ToString();
            var namef = name + "_" + dtY.Substring(2);
            var sqlGenerator = context.GetService<IUpdateSqlGenerator>();
            var sql = sqlGenerator.GenerateNextSequenceValueOperation(namef, schema ?? context.Model.GetDefaultSchema());
            var rawCommandBuilder = context.GetService<IRawSqlCommandBuilder>();
            var command = rawCommandBuilder.Build(sql);
            var connection = context.GetService<IRelationalConnection>();
            var logger = context.GetService<IDiagnosticsLogger<DbLoggerCategory.Database.Command>>();
            var parameters = new RelationalCommandParameterObject(connection, null, null, context, (IRelationalCommandDiagnosticsLogger?)logger);
            var result = command.ExecuteScalar(parameters);
            return Convert.ToInt64(result, CultureInfo.InvariantCulture);
        }
        public static string CreateihpoSequenceValue(this DbContext context, string name, string schema = null)
        {
            /*  var sqlGenerator = context.GetService<IUpdateSqlGenerator>();
              var sql = sqlGenerator.C(name, schema ?? context.Model.GetDefaultSchema());
              var rawCommandBuilder = context.GetService<IRawSqlCommandBuilder>();
              var command = rawCommandBuilder.Build(sql);
              var connection = context.GetService<IRelationalConnection>();
              var logger = context.GetService<IDiagnosticsLogger<DbLoggerCategory.Database.Command>>();
              var parameters = new RelationalCommandParameterObject(connection, null, null, context, (IRelationalCommandDiagnosticsLogger?)logger);
              var result = command.ExecuteScalar(parameters);
              return Convert.ToInt64(result, CultureInfo.InvariantCulture); */
            var dtY = DateTime.Now.Year.ToString();
            string sql = "create sequence dbo." + name + dtY.Substring(2) + " start with 1 increment by 1";
            var result = context.Database.ExecuteSqlRaw(sql);
            return result.ToString();
        }
    }
}
