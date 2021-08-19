const GET = async (req, rep) => {
  return { userId: req.params.id };
};

const PUT = async (req, res) => {
  req.log.info(`updating user with id ${req.params.id}`);
  return { message: 'user updated' };
};

module.exports = { GET, PUT };
