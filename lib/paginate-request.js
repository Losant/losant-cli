const { merge } = require('omnibelt');
module.exports = async (request, query, shouldUseOffset = false) => {
  let items = [];
  let extra = {};

  const perPage = 1000;
  let page = 0;
  extra = (shouldUseOffset && { offset: page*perPage, limit: perPage })|| { page, perPage };

  const results = await request(merge(query, extra)) || { items: [] };
  if (results.count) { items = results.items; }
  if (results.totalCount > 1000) {
    const totalPages = Math.ceil(results.totalCount / perPage);
    ++page; // since you already made one request above
    const requests = [];
    while (page <= totalPages) {
      extra = (shouldUseOffset && { offset: page*perPage, limit: perPage })|| { page, perPage };
      requests.push(request(merge(query, extra)));
      ++page;
    }
    (await Promise.all(requests)).map((res) => {
      items.push(...res.items);
    });
  }
  return items;
};
