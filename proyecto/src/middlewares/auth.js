export function ensureAuthenticated(req, res, next) {
  if (!req.session.user) {
    res.setHeader("Content-Type", "application/json");
    return res.status(401).json({ error: `No existen usuarios autenticados` });
  } else {
    next();
  }
}

export function ensureAccess(access = []) {
  return (req, res, next) => {
    access = access.map((a) => a.toLowerCase());

    if (access.includes("public")) {
      return next();
    }

    if (!req.session.user || !req.session.user.role) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(401)
        .json({ error: `No existen usuarios autenticados` });
    }

    if (!access.includes(req.session.user.role.toLowerCase())) {
      res.setHeader("Content-Type", "application/json");
      return res.status(403).json({ error: `No eres un administrador` });
    }

    next();
  };
}
