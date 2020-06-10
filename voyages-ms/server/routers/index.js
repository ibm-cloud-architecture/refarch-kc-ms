module.exports = function(app){
    require('./public')(app);
    require('./health')(app);
    require('./voyage')(app);
    require('./shutdown')(app);
};
