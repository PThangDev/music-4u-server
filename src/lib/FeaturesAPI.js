class featuresAPI {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  pagination() {
    const limit = Number(this.queryString.limit) || 100;
    const page = Number(this.queryString.page) || 1;
    const skip = limit * (page - 1);

    this.query = this.query.limit(limit).skip(skip);
    return this;
  }
  sorting(sortField) {
    const sort = this.queryString.sort;
    this.query = sort
      ? this.query.sort(sort)
      : sortField
      ? this.query.sort(sortField)
      : this.query.sort('-createdAt');
    return this;
  }
  searching() {
    const search = this.queryString.search;
    if (search) {
      this.query = this.query.find({
        $text: { $search: search },
      });
    } else {
      this.query = this.query.find();
    }
    return this;
  }

  //this.query = Products.find().find({
  //     {"price":{"$gt":"56.99"}}
  //  }).limit(limit).skip(skip).sort(sort)
  filtering() {
    const queryString = { ...this.queryString };
    const excludedFields = ['sort', 'page', 'limit', 'search'];
    excludedFields.forEach((field) => delete queryString[field]);

    //Convert queryString to JSON
    let queryStringResult = JSON.stringify(queryString);
    queryStringResult = queryStringResult.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => `$${match}`
    );
    //Convert queryString from JSON to Javascript
    queryStringResult = JSON.parse(queryStringResult);
    this.query = this.query.find(queryStringResult);
    // console.log(queryStringResult);
    return this;
  }
}
module.exports = featuresAPI;
