const { Class, sequelize } = require('../src/models');

async function clearBatches() {
  try {
    await sequelize.sync(); // Ensure connection and models
    console.log('Clearing all data in the Class table...');
    const result = await Class.destroy({ where: {} });
    console.log(`Deleted ${result} classes successfully. Students and attendance cascading should also be affected.`);
  } catch (error) {
    console.error('Error clearing batches:', error);
  } finally {
    process.exit(0);
  }
}

clearBatches();
