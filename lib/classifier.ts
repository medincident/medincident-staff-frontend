// Это имитация данных, которые в будущем придут с бэкенда (/api/classifier)
export type EventType = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  types: EventType[];
};

export const CLASSIFIER: Category[] = [
  {
    id: "cat_security",
    name: "Безопасность пациента",
    types: [
      { id: "type_fall", name: "Падение пациента" },
      { id: "type_identification", name: "Ошибка идентификации личности" },
      { id: "type_transfusion", name: "Осложнение при переливании крови" },
      { id: "type_test", name: "Test" },
    ],
  },
  {
    id: "cat_medication",
    name: "Лекарственная безопасность",
    types: [
      { id: "type_wrong_drug", name: "Введение неверного лекарства" },
      { id: "type_wrong_dose", name: "Введение неверной дозировки" },
      { id: "type_allergy", name: "Аллергическая реакция (неизвестная ранее)" },
    ],
  },
  {
    id: "cat_equipment",
    name: "Медицинское оборудование",
    types: [
      { id: "type_breakdown", name: "Поломка в процессе использования" },
      {
        id: "type_absence",
        name: "Отсутствие необходимого расходного материала",
      },
    ],
  },
];
