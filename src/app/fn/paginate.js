

export default function (req) {
    let paginate = {}

    let limit = Number(req.query.limit) || 100
    let page = Number(req.query.page) || 1

    if (limit <= 0) limit = 100
    if (page <= 0) page = 1

    if (limit > 5000) limit = 5000

    paginate.limit = limit
    paginate.page = (page - 1) * limit
    return paginate
}
