function getJwtSecret() {
  return process.env.JWT_SECRET || 'torreal-dev-cambia-esto';
}

module.exports = { getJwtSecret };
