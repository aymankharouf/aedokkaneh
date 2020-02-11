export const setup = {
  fixedFees: 0.025,
  maxDiscount: 100,
  profit: 0.1,
  weightErrorMargin: 10,
  orderLimit: 50000,
  exceedPricePercent: 0.05,
  returnPenalty: 100,
  invitationDiscount: 100,
  alarmDiscount: 100,
  firstOrderDiscount: 200,
  ratingDiscount: 50,
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
  {id: 'n', name: 'جديد'},
  {id: 'a', name: 'معتمد'},
  {id: 's', name: 'معلق'},
  {id: 'r', name: 'مرفوض'},
  {id: 'e', name: 'قيد التجهيز'},
  {id: 'f', name: 'مكتمل'},
  {id: 'p', name: 'جاهز'},
  {id: 'd', name: 'مستلم'},
  {id: 'c', name: 'ملغي'},
  {id: 'u', name: 'غير متوفر'},
  {id: 'i', name: 'استيداع'},
  {id: 'm', name: 'مدمج'}
]  

export const storeTypes = [
  {id: '1', name: 'المستودع'},
  {id: '2', name: 'دكانة'},
  {id: '3', name: 'محل'},
  {id: '4', name: 'سوبرماركت'},
  {id: '5', name: 'محل جملة'}
]

export const stockTransTypes = [
  {id: 'p', name: 'شراء'},
  {id: 'o', name: 'بيع تجزئة'},
  {id: 'i', name: 'استيداع'},
  {id: 'd', name: 'اتلاف'},
  {id: 'g', name: 'تبرع'},
  {id: 'r', name: 'ارجاع'},
  {id: 's', name: 'بيع'},
]

export const spendingTypes = [
  {id: 'w', name: 'سحب'},
  {id: 'p', name: 'بنزين'},
  {id: 'm', name: 'صيانة'},
  {id: 'f', name: 'فرق اسعار'}
]

export const orderPackStatus = [
  {id: 'n', name: 'جديد'},
  {id: 'p', name: 'شراء جزئي'},
  {id: 'f', name: 'تم الشراء'},
  {id: 'u', name: 'غير متوفر'},
  {id: 'pu', name: 'شراء جزئي والباقي غير متوفر'},
  {id: 'r', name: 'مرتجع'},
  {id: 'pr', name: 'مرتجع جزئي'}
]

export const alarmTypes = [
  {id: 'lp', name: 'الابلاغ عن سعر أقل', actor: 'c'},
  {id: 'cp', name: 'الابلاغ عن تغيير السعر', actor: 'o', isAvailable: 1},
  {id: 'av', name: 'الابلاغ عن توفر هذا المنتج/العرض', actor: 'o', isAvailable: -1},
  {id: 'ua', name: 'الابلاغ عن عدم توفر هذا المنتج/العرض', actor: 'o', isAvailable: 1},
  {id: 'la', name: 'الابلاغ عن توفر بديل بسعر اقل', actor: 'c'},
  {id: 'aa', name: 'الابلاغ عن توفر بديل', actor: 'o', isAvailable: 0},
  {id: 'eo', name: 'الابلاغ عن عرض لقرب انتهاء الصلاحية', actor: 'o', isAvailable: 0},
  {id: 'go', name: 'الابلاغ عن عرض لمجموعة', actor: 'o', isAvailable: 0},
]

export const callTypes = [
  {id: 'p', name: 'الاتصال هاتفيا'},
  {id: 's', name: 'ارسال رسالة نصية'},
  {id: 'w', name: 'ارسال رسالة واتساب'}
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
