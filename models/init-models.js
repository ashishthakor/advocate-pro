const DataTypes = require("sequelize").DataTypes;
const { sequelize } = require("../lib/database");
const User = require("./User")(sequelize, DataTypes);
const Case = require("./Case")(sequelize, DataTypes);
const ChatMessage = require("./ChatMessage")(sequelize, DataTypes);
const Document = require("./Document")(sequelize, DataTypes);
const Notice = require("./Notice")(sequelize, DataTypes);

// Define associations

// User-Case Relations (User can have many cases)
User.hasMany(Case, { as: 'userCases', foreignKey: 'user_id' });
Case.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

// User-Case Relations (Advocate can be assigned to many cases)
User.hasMany(Case, { as: 'advocateCases', foreignKey: 'advocate_id' });
Case.belongsTo(User, { as: 'advocate', foreignKey: 'advocate_id' });

// Case-ChatMessage Relations (Case can have many chat messages)
Case.hasMany(ChatMessage, { as: 'chatMessages', foreignKey: 'case_id' });
ChatMessage.belongsTo(Case, { as: 'case', foreignKey: 'case_id' });

// User-ChatMessage Relations (User can send many messages)
User.hasMany(ChatMessage, { as: 'sentMessages', foreignKey: 'user_id' });
ChatMessage.belongsTo(User, { as: 'sender', foreignKey: 'user_id' });

// Case-Document Relations (Case can have many documents)
Case.hasMany(Document, { as: 'documents', foreignKey: 'case_id' });
Document.belongsTo(Case, { as: 'case', foreignKey: 'case_id' });

// User-Document Relations (User can upload many documents)
User.hasMany(Document, { as: 'uploadedDocuments', foreignKey: 'uploaded_by' });
Document.belongsTo(User, { as: 'uploader', foreignKey: 'uploaded_by' });

// Case-Notice Relations (Case can have many notices)
Case.hasMany(Notice, { as: 'notices', foreignKey: 'case_id' });
Notice.belongsTo(Case, { as: 'case', foreignKey: 'case_id' });

module.exports = {
  User,
  Case,
  ChatMessage,
  Document,
  Notice
};
