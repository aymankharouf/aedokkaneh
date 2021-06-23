export const setup = {
  fixedFees: 0.01,
  maxDiscount: 10,
  orderLimit: 5000,
  returnPenalty: 5,
  invitationDiscount: 5,
  firstOrderDiscount: 10,
  profit: 0.05
}

export const randomColors = [
  {id: 0, name: 'red'},
  {id: 1, name: 'green'},
  {id: 2, name: 'blue'},
  {id: 3, name: 'pink'},
  {id: 4, name: 'yellow'},
  {id: 5, name: 'orange'},
  {id: 6, name: 'purple'},
  {id: 7, name: 'deeppurple'},
  {id: 8, name: 'lightblue'},
  {id: 9, name: 'teal'},
]

export const orderStatus = [
  {id: 'n', name: 'قيد الموافقة'},
  {id: 'a', name: 'تمت الموافقة'},
  {id: 's', name: 'معلق'},
  {id: 'r', name: 'مرفوض'},
  {id: 'e', name: 'قيد التنفيذ'},
  {id: 'f', name: 'تم التنفيذ'},
  {id: 'p', name: 'جاهز'},
  {id: 'd', name: 'مستلم'},
  {id: 'c', name: 'ملغي'},
  {id: 'u', name: 'غير متوفر'},
  {id: 'i', name: 'استيداع'},
  {id: 'm', name: 'مدمج'}
]  

export const storeTypes = [
  {id: '1', name: 'المستودع'},
  {id: '2', name: 'صغير'},
  {id: '3', name: 'متوسط'},
  {id: '4', name: 'كبير'},
  {id: '5', name: 'جملة'}
]

export const stockTransTypes = [
  {id: 'p', name: 'شراء'},
  {id: 'o', name: 'بيع تجزئة'},
  {id: 'i', name: 'استيداع'},
  {id: 'd', name: 'اتلاف'},
  {id: 'g', name: 'تبرع'},
  {id: 'r', name: 'ارجاع'},
  {id: 'c', name: 'الغاء شراء'},
  {id: 's', name: 'بيع'},
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

export const alarmTypes = [
  {id: 'cp', name: 'الابلاغ عن تغيير السعر', isAvailable: 1},
  {id: 'av', name: 'الابلاغ عن توفر هذا المنتج/العرض', isAvailable: -1},
  {id: 'ua', name: 'الابلاغ عن عدم توفر هذا المنتج/العرض', isAvailable: 1},
  {id: 'aa', name: 'الابلاغ عن توفر بديل', isAvailable: 0},
  {id: 'eo', name: 'الابلاغ عن عرض لقرب انتهاء الصلاحية', isAvailable: 0},
  {id: 'go', name: 'الابلاغ عن عرض لمجموعة', isAvailable: 0},
]

export const orderRequestTypes = [
  {id: 'e', name: 'تعديل'},
  {id: 'm', name: 'دمج'},
  {id: 'c', name: 'الغاء'}
]

export const advertType = [
  {id: 'a', name: 'اعلان'},
  {id: 'n', name: 'تنويه'}
]

export const friendStatus = [
  {id: 'n', name: 'قيد الموافقة'},
  {id: 's', name: 'ارسلت الدعوة'},
  {id: 'o', name: 'مدعو سابقا'},
  {id: 'r', name: 'مستخدم فعلي'}
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