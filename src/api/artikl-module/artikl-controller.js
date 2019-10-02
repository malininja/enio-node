
const pdvs = [{
  PdvId: 1,
  Naziv: "prvi pdv",
  Stopa: 22,
}, {
  PdvId: 2,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 3,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 4,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 5,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 6,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 7,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 8,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 9,
  Naziv: "zadnji pdv",
  Stopa: 25,
}, {
  PdvId: 10,
  Naziv: "zadnji pdv",
  Stopa: 25,
}
];

const response = {
  page: 2,
  total: 4,
  records: 36,
  rows: pdvs,
};

function getAll(req, res, next) {
  res.send(response);
  return next();
}

module.exports = { getAll };
