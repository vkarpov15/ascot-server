
/*
 * GET /
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Ascot' });
};

/*
 * GET /about
 */

exports.about = function(req, res) {
  res.render('about', {title: 'About'});
};

/*
 * GET /tumblr
 */
exports.tumblr = function(req, res) {
  res.render('tumblr', { title : 'Ascot :: Tumblr Help' });
};
