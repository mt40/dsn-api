/* Sample config.json file content:
---------------------------
{
    "dialect": "mysql",
    "username": "root",
    "password": "",
    "host": "localhost",
    "port": "3306",
    "database": "dsn"
}
---------------------------
*/

var configFile = global.localDb ? 'config-local.json' : 'config-server.json';
var config = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, configFile), 'utf8'));
var connectionString =
    config.dialect + '://' + config.username + ':' + config.password
        + '@' + config.host + ':' + config.port + '/' + config.database;

/* Create a new client */
var sequelize = require("sequelize");
var client = new sequelize(connectionString, {
    // more options here
    // http://sequelizejs.com/docs/1.7.8/usage#options
    logging: global.logging ? console.log : false
});

/* Models */

var User = client.define('User', {
    fullname: {
        type: sequelize.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    username: {
        type: sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: true }
    },
    password: {
        type: sequelize.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    email: {
        type: sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    }
}, { underscored: true });

var Dream = client.define('Dream', {
    text: { type: sequelize.TEXT, allowNull: false }
}, { underscored: true });

var DreamLike = client.define('DreamLike', {
    user_id: { type: sequelize.INTEGER, allowNull: false },
    value: { type: sequelize.BOOLEAN, allowNull: false, defaultValue: true }
}, { underscored: true });

var DreamComment = client.define('DreamComment', {
    user_id: { type: sequelize.INTEGER, allowNull: false },
    text: { type: sequelize.TEXT, allowNull: false }
}, { underscored: true });

var Achievement = client.define('Achievement', {
    text: { type: sequelize.TEXT, allowNull: false }
}, { underscored: true });

var AchievementLike = client.define('AchievementLike', {
    user_id: { type: sequelize.INTEGER, allowNull: false },
    value: { type: sequelize.BOOLEAN, allowNull: false, defaultValue: true }
}, { underscored: true });

var AchievementComment = client.define('AchievementComment', {
    user_id: { type: sequelize.INTEGER, allowNull: false },
    text: { type: sequelize.TEXT, allowNull: false }
}, { underscored: true });

var Session = client.define('Session', {
    expire: { type: sequelize.DATE, allowNull: false }
}, { underscored: true });

var Hashtag = client.define('Hashtag', {
    text: { type: sequelize.TEXT, allowNull: false }
}, { underscored: true });

var Relationship = client.define('Relationship', {
    following: { type: sequelize.INTEGER, allowNull: false },
    follower: { type: sequelize.INTEGER, allowNull: false }
});

/* Relations */

Dream.belongsTo(User);
Dream.hasMany(Achievement);
Dream.hasMany(DreamLike, { as: 'Likes'});
Dream.hasMany(DreamComment, { as: 'Comments' });
Dream.hasMany(Hashtag);

DreamLike.belongsTo(Dream);
DreamComment.belongsTo(Dream);

Achievement.hasMany(AchievementLike, { as: 'Likes' });
Achievement.hasMany(AchievementComment, { as: 'Comments' });
Achievement.hasMany(Hashtag);

AchievementLike.belongsTo(Achievement);
AchievementComment.belongsTo(Achievement);

DreamComment.hasMany(Hashtag);
AchievementComment.hasMany(Hashtag);

Hashtag.hasMany(Dream);
Hashtag.hasMany(DreamComment);
Hashtag.hasMany(Achievement);
Hashtag.hasMany(AchievementComment);

User.hasMany(Session);

/* Execute */

client
    .sync({ force: global.resetDb })
    .complete(function (err) {
        if (err) {
            console.log('An error occurred while creating the table:', err)
        } else {
            console.log('It worked!')
        }
    });

/* Exports */

module.exports.client = client;
module.exports.models = {
    User: User,
    Dream: Dream,
    DreamLike: DreamLike,
    DreamComment: DreamComment,
    Achievement: Achievement,
    AchievementLike: AchievementLike,
    AchievementComment: AchievementComment,
    Session: Session,
    Hashtag: Hashtag,
    Relationship: Relationship
}