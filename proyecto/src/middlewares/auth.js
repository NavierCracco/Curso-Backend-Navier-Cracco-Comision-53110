export function ensureAuthenticated(req, res, next) {
  if (!req.session.userId) {
    res.status(401).send({ error: "no hay usuarios autenticados" });
  } else {
    next();
  }
}

export function ensureAdmin(req, res, next) {
  if (!req.session.userId || req.session.userId.role !== "admin") {
    res.status(401).send({ error: "no eres administrador" });
  } else {
    next();
  }
}
