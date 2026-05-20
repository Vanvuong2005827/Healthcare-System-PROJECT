package com.vuong.pharmaceuticalinventoryservice.config;

import com.vuong.pharmaceuticalinventoryservice.entity.MedicalEquipmentEntity;
import com.vuong.pharmaceuticalinventoryservice.entity.MedicineEntity;
import com.vuong.pharmaceuticalinventoryservice.enums.EquipmentType;
import com.vuong.pharmaceuticalinventoryservice.enums.MedicineType;
import com.vuong.pharmaceuticalinventoryservice.repository.MedicalEquipmentRepository;
import com.vuong.pharmaceuticalinventoryservice.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Slf4j
@RequiredArgsConstructor
public class InventoryDataSeeder implements CommandLineRunner {

    private final MedicineRepository medicineRepository;
    private final MedicalEquipmentRepository medicalEquipmentRepository;

    @Value("${app.seed.inventory.enabled:true}")
    private boolean seedInventoryEnabled;

    @Override
    public void run(String... args) {
        if (!seedInventoryEnabled) {
            log.info("Inventory fake-data seeding is disabled");
            return;
        }

        seedMedicines(20);
        seedMedicalEquipments(20);
    }

    private void seedMedicines(int minimumRecords) {
        long existing = medicineRepository.count();
        if (existing >= minimumRecords) {
            log.info("Medicine table already has {} records. Skipping fake-data seed.", existing);
            return;
        }

        String[] medicineNames = {
                "Paracetamol", "Amoxicillin", "Ibuprofen", "Cetirizine", "Omeprazole",
                "Azithromycin", "Metformin", "Atorvastatin", "Amlodipine", "Losartan",
                "Diclofenac", "Dextromethorphan", "Salbutamol", "Clopidogrel", "Cefixime",
                "Prednisolone", "Naproxen", "Methylcobalamin", "Vitamin C", "Fexofenadine"
        };

        String[] genericNames = {
                "Acetaminophen", "Amoxicillin", "Ibuprofen", "Cetirizine Hydrochloride", "Omeprazole",
                "Azithromycin", "Metformin Hydrochloride", "Atorvastatin Calcium", "Amlodipine Besylate", "Losartan Potassium",
                "Diclofenac Sodium", "Dextromethorphan HBr", "Salbutamol Sulfate", "Clopidogrel Bisulfate", "Cefixime",
                "Prednisolone", "Naproxen Sodium", "Mecobalamin", "Ascorbic Acid", "Fexofenadine Hydrochloride"
        };

        String[] manufacturers = {
                "MediCare Pharma", "HealthPlus Labs", "NovaCure", "Wellness Biotech", "VitaMed",
                "Zenith Pharma", "Global Remedies", "CareGen", "Optima Drugs", "Prime Therapeutics"
        };

        MedicineType[] medicineTypes = MedicineType.values();
        int startIndex = (int) existing;

        for (int i = startIndex; i < minimumRecords; i++) {
            MedicineEntity entity = new MedicineEntity();
            entity.setMedicineName(medicineNames[i % medicineNames.length] + " " + (i + 1));
            entity.setGenericName(genericNames[i % genericNames.length]);
            entity.setMedicineType(medicineTypes[i % medicineTypes.length]);
            entity.setManufacturer(manufacturers[i % manufacturers.length]);
            entity.setManufactureDate(LocalDate.now().minusDays(120L + i * 7L));
            entity.setExpiryDate(LocalDate.now().plusDays(240L + i * 15L));
            entity.setIsOccupied(i % 5 == 0);
            entity.setIsActive(true);
            medicineRepository.save(entity);
        }

        log.info("Inserted {} fake medicine records", minimumRecords - startIndex);
    }

    private void seedMedicalEquipments(int minimumRecords) {
        long existing = medicalEquipmentRepository.count();
        if (existing >= minimumRecords) {
            log.info("Medical equipment table already has {} records. Skipping fake-data seed.", existing);
            return;
        }

        String[] equipmentNames = {
                "ECG Monitor", "Ultrasound Scanner", "Infusion Pump", "Defibrillator", "Ventilator",
                "Patient Monitor", "Syringe Pump", "Anesthesia Machine", "X-Ray Unit", "MRI Coil",
                "CT Injector", "Nebulizer", "Dialysis Machine", "Pulse Oximeter", "Surgical Lamp",
                "Autoclave", "Blood Analyzer", "Electrosurgical Unit", "Infant Warmer", "Transport Ventilator"
        };

        String[] manufacturers = {
                "MedTech Global", "BioInstruments", "HealthEquip", "Omni Medical", "Caretronics",
                "Apex Devices", "Lifeline Systems", "Precision Med", "Nexa Healthcare", "Vertex Medical"
        };

        EquipmentType[] equipmentTypes = EquipmentType.values();
        int startIndex = (int) existing;

        for (int i = startIndex; i < minimumRecords; i++) {
            MedicalEquipmentEntity entity = new MedicalEquipmentEntity();
            entity.setMedicalEquipmentName(equipmentNames[i % equipmentNames.length] + " " + (i + 1));
            entity.setMedicalEquipmentType(equipmentTypes[i % equipmentTypes.length]);
            entity.setManufacturer(manufacturers[i % manufacturers.length]);
            entity.setManufactureDate(LocalDate.now().minusDays(250L + i * 10L));
            entity.setExpiryDate(LocalDate.now().plusDays(365L + i * 20L));
            entity.setIsOccupied(i % 6 == 0);
            entity.setIsActive(true);
            medicalEquipmentRepository.save(entity);
        }

        log.info("Inserted {} fake medical equipment records", minimumRecords - startIndex);
    }
}