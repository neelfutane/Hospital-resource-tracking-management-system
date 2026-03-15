const { emitAlert } = require('./socket.service');

const checkBedAlerts = (ward, beds) => {
  const wardBeds = beds.filter(bed => bed.ward === ward);
  const totalBeds = wardBeds.length;
  const availableBeds = wardBeds.filter(bed => bed.status === 'available').length;
  
  if (totalBeds > 0) {
    const availablePercentage = (availableBeds / totalBeds) * 100;
    
    if (availablePercentage < 15) {
      const alertMessage = `⚠️ Critical: ${ward} ward has only ${availableBeds} available beds (${Math.round(availablePercentage)}%)`;
      emitAlert(alertMessage);
    }
  }
};

const checkEquipmentAlerts = (equipment) => {
  const criticalEquipment = equipment.filter(item => item.status === 'critical');
  
  if (criticalEquipment.length > 0) {
    criticalEquipment.forEach(item => {
      const alertMessage = `🚨 Critical Alert: ${item.type} (${item.serialId}) in ${item.location} requires immediate attention`;
      emitAlert(alertMessage);
    });
  }
};

module.exports = {
  checkBedAlerts,
  checkEquipmentAlerts
};
