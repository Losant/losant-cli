const { isNil, merge  } = require('omnibelt');
module.exports =  async (request, query, shouldUseOffset = false) => {
  let items = [];
  if (!query.perPage) { query.perPage = query.limit || 1000; }
  if (isNil(query.page)) { query.page = 0; }
  const results = await request(query) || { items: [] };
  if (results.count) { items = results.items; }
  if (results.totalCount > 1000) {
    const totalPages = Math.ceil(results.totalCount / 1000);
    let page = query.page + 1; // since you already made one request above
    const requests = [];
    while (page <= totalPages) {
      requests.push(request(merge(query, (shouldUseOffset &&  { offset: page*query.perPage }) || { page })));
      ++page;
    }
    (await Promise.all(requests)).map((res) => {
      items.push(...res.items);
    });
  }
  return items;
};
