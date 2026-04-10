using System.Linq.Expressions;

namespace FinexAPI.Helper
{
    public static class Sort
    {
        public static IQueryable<TEntity> OrderByCustom<TEntity>(this IQueryable<TEntity> source, string sortKey, bool desc)
        {
            /*            string sortKeyStr = desc ? "OrderByDescending" : "OrderBy";
                        var type = typeof(TEntity);
                        var property = type.GetProperty(sortKey);
                        var parameter = Expression.Parameter(type, "p");
                        var propetyAccess = Expression.MakeMemberAccess(parameter, property);
                        var orderByExpression = Expression.Lambda(propetyAccess, parameter);
                        var result = Expression.Call(typeof(Queryable), sortKeyStr, new Type[] { type, property.PropertyType }, source.Expression, Expression.Quote(orderByExpression));
                        return source.Provider.CreateQuery<TEntity>(result);*/

            var propertyNames = sortKey.Split('.');
            var parameter = Expression.Parameter(typeof(TEntity), "x");
            Expression property = parameter;
            foreach (var propertyName in propertyNames)
            {
                property = Expression.PropertyOrField(property, propertyName);
            }
            var lamda = Expression.Lambda<Func<TEntity, object>>(Expression.Convert(property, typeof(object)), parameter);
            return desc ? source.AsQueryable().OrderByDescending(lamda) : source.AsQueryable().OrderBy(lamda);

        }
    }
}
