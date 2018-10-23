module.exports =  async (request, query) => {
  let items = [];
  const results = await request(query) || { items: [] };
  if (results.count) { items = results.items; }
  if (results.totalCount > 1000) {
    const totalPages = Math.ceil(results.totalCount / 1000);
    let page = 1;
    const requests = [];
    while (page <= totalPages) {
      query.page = page;
      requests.push(request(query));
      ++page;
    }
    (await Promise.all(requests)).map((res) => {
      items.push(...res.items);
    });
  }
  return items;
};
