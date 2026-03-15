const occupancyCalculator = (beds) => {
  const wards = ['ICU', 'Emergency', 'General', 'Pediatrics', 'Maternity', 'Surgery'];
  const result = {};

  wards.forEach(ward => {
    const wardBeds = beds.filter(bed => bed.ward === ward);
    const total = wardBeds.length;
    const available = wardBeds.filter(bed => bed.status === 'available').length;
    const occupied = wardBeds.filter(bed => bed.status === 'occupied').length;
    const maintenance = wardBeds.filter(bed => bed.status === 'maintenance').length;
    
    const occupancyPercent = total > 0 ? Math.round((occupied / total) * 100) : 0;

    result[ward] = {
      total,
      available,
      occupied,
      maintenance,
      occupancyPercent
    };
  });

  return result;
};

module.exports = { occupancyCalculator };
