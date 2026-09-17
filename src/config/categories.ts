export interface BusinessCategory {
  label: string;
  value: string;
  suggestedTopics: string[];
}

export const businessCategories: BusinessCategory[] = [
  {
    label: 'Dental Clinic',
    value: 'dental_clinic',
    suggestedTopics: ['Doctor', 'Staff', 'Cleaning', 'Root Canal', 'Painless Treatment', 'Waiting Time', 'Cleanliness', 'Pricing', 'Communication', 'Overall Experience'],
  },
  {
    label: 'Salon',
    value: 'salon',
    suggestedTopics: ['Stylist', 'Service Quality', 'Ambience', 'Cleanliness', 'Pricing', 'Waiting Time', 'Staff Friendliness', 'Hygiene', 'Overall Experience'],
  },
  {
    label: 'Restaurant',
    value: 'restaurant',
    suggestedTopics: ['Food Quality', 'Service', 'Ambience', 'Cleanliness', 'Value for Money', 'Portion Size', 'Waiting Time', 'Staff', 'Overall Experience'],
  },
  {
    label: 'Cafe',
    value: 'cafe',
    suggestedTopics: ['Coffee Quality', 'Food', 'Ambience', 'Service', 'Cleanliness', 'Pricing', 'Staff Friendliness', 'Overall Experience'],
  },
  {
    label: 'Gym',
    value: 'gym',
    suggestedTopics: ['Equipment', 'Trainers', 'Cleanliness', 'Ambience', 'Crowd', 'Pricing', 'Staff', 'Overall Experience'],
  },
  {
    label: 'Jewellery Store',
    value: 'jewellery_store',
    suggestedTopics: ['Product Quality', 'Variety', 'Staff Knowledge', 'Pricing', 'Trust', 'Customer Service', 'Ambience', 'Overall Experience'],
  },
  {
    label: 'Diagnostic Centre',
    value: 'diagnostic_centre',
    suggestedTopics: ['Staff', 'Cleanliness', 'Report Accuracy', 'Waiting Time', 'Pricing', 'Equipment', 'Communication', 'Overall Experience'],
  },
  {
    label: 'Car/Bike Service Centre',
    value: 'service_centre',
    suggestedTopics: ['Service Quality', 'Staff', 'Pricing', 'Timeliness', 'Transparency', 'Communication', 'Cleanliness', 'Overall Experience'],
  },
  {
    label: 'Small Hotel',
    value: 'small_hotel',
    suggestedTopics: ['Rooms', 'Cleanliness', 'Staff', 'Food', 'Location', 'Value for Money', 'Ambience', 'Overall Experience'],
  },
  {
    label: 'Tuition Centre',
    value: 'tuition_centre',
    suggestedTopics: ['Teacher Quality', 'Study Material', 'Batch Size', 'Results', 'Infrastructure', 'Communication', 'Pricing', 'Overall Experience'],
  },
  {
    label: 'Local Retail Store',
    value: 'retail_store',
    suggestedTopics: ['Product Variety', 'Pricing', 'Staff Helpfulness', 'Store Layout', 'Cleanliness', 'Customer Service', 'Overall Experience'],
  },
  {
    label: 'Other',
    value: 'other',
    suggestedTopics: ['Staff', 'Service Quality', 'Cleanliness', 'Pricing', 'Waiting Time', 'Communication', 'Overall Experience'],
  },
];

export function getCategoryByValue(value: string): BusinessCategory | undefined {
  return businessCategories.find((c) => c.value === value);
}

export function getCategoryLabel(value: string): string {
  return getCategoryByValue(value)?.label ?? value;
}

export function getSuggestedTopics(categoryValue: string): string[] {
  return getCategoryByValue(categoryValue)?.suggestedTopics ?? ['Staff', 'Service Quality', 'Cleanliness', 'Pricing', 'Overall Experience'];
}
