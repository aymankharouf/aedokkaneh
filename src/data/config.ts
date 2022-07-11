export const setup = {
  orderLimit: 2000,
  nextOrderLimit: 5000,
  stockName: 'المستودع',
  mobile: '0799982800'
}

export const randomColors = [
  {id: 0, name: 'darkblue'},
  {id: 1, name: 'deeppink'},
  {id: 2, name: 'darkgreen'},
  {id: 3, name: 'red'},
  {id: 4, name: 'purple'},
  {id: 5, name: 'maroon'},
  {id: 6, name: 'darkslategray'},
  {id: 7, name: 'crimson'},
  {id: 8, name: 'chocolate'},
  {id: 9, name: 'darkolivegreen'},
]

export const orderStatus = [
  {id: 'n', name: 'قيد الموافقة'},
  {id: 'a', name: 'تمت الموافقة'},
  {id: 's', name: 'معلق'},
  {id: 'e', name: 'قيد التنفيذ'},
  {id: 'f', name: 'تم التنفيذ'},
  {id: 'd', name: 'مستلم'},
  {id: 'c', name: 'ملغي'},
] 

export const orderTransTypes = [
  {id: 'n', name: 'استحداث'},
  {id: 'a', name: 'اعتماد'},
  {id: 's', name: 'تعليق'},
  {id: 'u', name: 'تعديل'},
  {id: 'f', name: 'انهاء'},
  {id: 'd', name: 'تسليم'},
]

export const quantityTypes = [
  {id: 'c', name: 'عدد'},
  {id: 'wo', name: 'وزن'},
  {id: 'wc', name: 'وزن وعدد'},
]

export const stockTransTypes = [
  {id: 'p', name: 'شراء'},
  {id: 's', name: 'بيع'},
  {id: 'r', name: 'ارجاع'},
  {id: 'd', name: 'اتلاف'},
  {id: 'g', name: 'تبرع'},
  {id: 'u', name: 'فتح'},
]

export const spendingTypes = [
  {id: 'w', name: 'سحب'},
  {id: 'p', name: 'بنزين'},
  {id: 'm', name: 'صيانة'},
  {id: 'f', name: 'فرق اسعار'}
]

export const orderPackStatus = [
  {id: 'n', name: 'قيد الشراء'},
  {id: 'p', name: 'شراء جزئي'},
  {id: 'f', name: 'تم الشراء'},
  {id: 'u', name: 'غير متوفر'},
  {id: 'pu', name: 'شراء جزئي والباقي غير متوفر'},
  {id: 'r', name: 'مرتجع'},
  {id: 'pr', name: 'مرتجع جزئي'}
]


export const advertType = [
  {id: 'a', name: 'اعلان'},
  {id: 'n', name: 'تنويه'}
]

export const paymentTypes = [
  {id: 'p', name: 'دفعة'},
  {id: 'pl', name: 'خسارة شراء'},
  {id: 'pp', name: 'ربح شراء'},
  {id: 'r', name: 'عائد'},
  {id: 'c', name: 'مطالبة'},
  {id: 'sl', name: 'خسارة بيع'},
  {id: 'sp', name: 'ربح بيع'},
  {id: 'rl', name: 'خسارة ارجاع'},
  {id: 'rp', name: 'ربح ارجاع'}
]

export const colors = [
  {id: 0, name: 'darkblue'},
  {id: 1, name: 'deeppink'},
  {id: 2, name: 'darkgreen'},
  {id: 3, name: 'red'},
  {id: 4, name: 'purple'},
  {id: 5, name: 'maroon'},
  {id: 6, name: 'darkslategray'},
  {id: 7, name: 'crimson'},
  {id: 8, name: 'chocolate'},
  {id: 9, name: 'darkolivegreen'},
]

export const patterns = {
  password: /^.{4,50}$/,
  name: /^.{3,50}$/,
  mobile: /^07[7-9][0-9]{7}$/,
  email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
}