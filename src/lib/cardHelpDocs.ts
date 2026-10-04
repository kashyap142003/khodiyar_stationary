import { Language } from './i18n';

export interface CardHelpDoc {
  id: string;
  titleGu: string;
  titleEn: string;
  categoryGu: string;
  categoryEn: string;
  whatIsItGu: string;
  whatIsItEn: string;
  calculationGu?: string;
  calculationEn?: string;
  actionGuideGu: string[];
  actionGuideEn: string[];
  exampleGu?: string;
  exampleEn?: string;
}

export const CARD_HELP_DOCS: Record<string, CardHelpDoc> = {
  sales: {
    id: 'sales',
    titleGu: 'કુલ વેચાણ (Total Sales)',
    titleEn: 'Total Sales (કુલ વેચાણ)',
    categoryGu: 'આવક / વેચાણ',
    categoryEn: 'Revenue / Sales',
    whatIsItGu:
      'આજના દિવસમાં દુકાન પર થયેલું તમામ વેચાણ દર્શાવે છે (છૂટક કાઉન્ટર વેચાણ + સ્કૂલ/ખાતાના ગ્રાહકોનું બિલ).',
    whatIsItEn:
      'Total sales made today across both daily counter walk-ins and school/institution credit bills.',
    calculationGu: 'કુલ વેચાણ = કાઉન્ટર રોકડ + કાઉન્ટર UPI + સ્કૂલ/ગ્રાહક બિલ રકમ',
    calculationEn: 'Total Sales = Counter Cash + Counter UPI + School/Customer Invoices',
    actionGuideGu: [
      'રોજના ૧૦૦+ નાના ગ્રાહકો માટે અલગ અલગ એન્ટ્રી ન કરો; સાંજે "દૈનિક છૂટક વેચાણ" માં રોકડા + UPI નો સરવાળો લખી લો.',
      'સ્કૂલ, ક્લાસીસ કે ઉધાર માલ લેનાર ગ્રાહકોનું નામ લખીને "સ્કૂલ/ખાતા વેચાણ" માં નોંધો.',
    ],
    actionGuideEn: [
      'For 100+ small daily walk-ins, do not enter 100 bills; just enter the day-end total in Daily Counter Total.',
      'For schools and regular credit customers, record named invoices under School/Khata Sale.',
    ],
    exampleGu: 'આજે છૂટક ગલ્લાના ₹6,000 + સરદાર પટેલ હાઈસ્કૂલનું ₹4,000 નું બિલ = કુલ વેચાણ ₹10,000.',
    exampleEn: 'Today counter cash ₹6,000 + Sardar Patel High School bill ₹4,000 = Total Sales ₹10,000.',
  },

  collections: {
    id: 'collections',
    titleGu: 'ઉઘરાણી આવક (Customer Collections)',
    titleEn: 'Customer Collections (ઉઘરાણી આવક)',
    categoryGu: 'રોકડ આવક',
    categoryEn: 'Cash Inflow',
    whatIsItGu:
      'જે ગ્રાહકો પાસેથી અગાઉ ઉધાર માલના રૂપિયા લેવાના બાકી હતા, તેમની પાસેથી આજે વસૂલ થયેલી રોકડ કે UPI રકમ.',
    whatIsItEn:
      'Cash and UPI recovered today from customers who had previous unpaid credit dues.',
    calculationGu: 'ઉઘરાણી આવક = જૂની બાકી પેટે ગ્રાહકોએ જમા કરાવેલ રકમનો સરવાળો',
    calculationEn: 'Collections = Total debt repayments collected from customers today',
    actionGuideGu: [
      'જ્યારે કોઈ સ્કૂલ કે ગ્રાહક જૂનું બિલ ચૂકવવા આવે ત્યારે "ઉઘરાણી જમા લો" બટન દબાવો.',
      'આ રકમ જમા થવાથી ગ્રાહકનું ખાતું ઘટી જશે અને તમારો ગલ્લો/બેંક વધશે.',
    ],
    actionGuideEn: [
      'When a customer comes to clear their past bill, tap "Receive Payment".',
      'This reduces the customer debt ledger and increases your cash/bank balance.',
    ],
    exampleGu: 'પ્રિન્સિપાલ સાહેબ આવ્યા અને ગયા અઠવાડિયાના ₹3,000 રોકડા જમા કરાવ્યા.',
    exampleEn: 'Principal visited and paid ₹3,000 cash towards last week pending bill.',
  },

  credit_given: {
    id: 'credit_given',
    titleGu: 'ઉધાર આપેલ (Credit Given)',
    titleEn: 'Credit Given (ઉધાર આપેલ)',
    categoryGu: 'લેણાં / ખાતાવહી',
    categoryEn: 'Receivables / Khata',
    whatIsItGu:
      'આજે ગ્રાહકો કે સ્કૂલોને જે માલ આપ્યો પણ તેની ચુકવણી બાકી રહી ગઈ (ગ્રાહકના ખાતામાં ઉધાર બોલે છે).',
    whatIsItEn:
      'The unpaid amount for goods delivered today that has been added to customer debt ledgers.',
    calculationGu: 'ઉધાર આપેલ = આજના વેચાણ બિલ - તરત મળેલી રોકડ/UPI',
    calculationEn: 'Credit Given = Today Bill Amount − Immediate Cash/UPI Received',
    actionGuideGu: [
      'આ રકમ નિયમિત ચેક કરતા રહો જેથી ખબર પડે કે આજે કેટલો માલ ઉધારમાં ગયો.',
      'જો કોઈ ગ્રાહકની ઉધાર મર્યાદા (Credit Limit) વટી જાય તો સિસ્ટમ તમને ચેતવણી આપશે.',
    ],
    actionGuideEn: [
      'Monitor this daily to keep control over how much credit is handed out.',
      'The app warns you automatically if a customer exceeds their allowed credit limit.',
    ],
    exampleGu: 'સ્કૂલે ₹5,000 નો માલ લીધો, ₹1,000 આપ્યા, તો ₹4,000 "ઉધાર આપેલ" માં ગણાશે.',
    exampleEn: 'School took ₹5,000 stationery, paid ₹1,000 down-payment; ₹4,000 is added as Credit Given.',
  },

  expenses: {
    id: 'expenses',
    titleGu: 'દુકાન ખર્ચ (Shop Expenses)',
    titleEn: 'Shop Expenses (દુકાન ખર્ચ)',
    categoryGu: 'ખર્ચ / જાવક',
    categoryEn: 'Store Expenses',
    whatIsItGu:
      'દુકાન ચલાવવા માટે આજના દિવસમાં થયેલા તમામ ખર્ચા (ભાડું, લાઈટબિલ, ચા-પાણી, માલ લાવવાનું ભાડું/ટેમ્પો, સ્ટેશનરી પેકિંગ).',
    whatIsItEn:
      'Daily operational expenses incurred to run the shop (rent, power, tea, delivery freight, packaging).',
    calculationGu: 'દુકાન ખર્ચ = તમામ નાની-મોટી ખર્ચ એન્ટ્રીઓનો સરવાળો',
    calculationEn: 'Expenses = Sum of all operational store payments today',
    actionGuideGu: [
      'નાના ખર્ચા (જેવા કે ₹50 ચા, ₹150 ટેમ્પો ભાડું) તરત "દુકાન ખર્ચ" માં નોંધી લો જેથી રાત્રે ગલ્લો મેળવતી વખતે તફાવત ન આવે.',
    ],
    actionGuideEn: [
      'Record small expenses (like ₹50 tea, ₹150 freight) promptly so your evening cash drawer tallies perfectly.',
    ],
    exampleGu: 'નવનીત પુસ્તકોની ડિલિવરી માટે ટેમ્પોવાળાને ₹350 રોકડા ભાડું ચૂકવ્યું.',
    exampleEn: 'Paid ₹350 cash tempo freight for Navneet notebook delivery.',
  },

  walk_in_total: {
    id: 'walk_in_total',
    titleGu: 'દૈનિક છૂટક વેચાણ (Daily Counter Total)',
    titleEn: 'Daily Counter Total (દૈનિક છૂટક વેચાણ)',
    categoryGu: 'ઝડપી એન્ટ્રી',
    categoryEn: 'Fast Entry',
    whatIsItGu:
      'દિવસે આવતા ૧૦૦+ છૂટક ગ્રાહકો (જે પેન, નોટબુક, ઝેરોક્ષ, પ્રોજેક્ટ પેપર રોકડેથી ખરીદે છે) માટે એકસાથે લમ્પસમ એન્ટ્રી કરવાનો વિકલ્પ.',
    whatIsItEn:
      'Consolidated lump-sum entry for 100+ random walk-in customers who buy items for instant Cash/UPI.',
    actionGuideGu: [
      'દિવસે દરેક નાની પેન કે ઝેરોક્ષની અલગ એન્ટ્રી કરવાની જરૂર નથી.',
      'સાંજે ગલ્લાના રોકડા અને UPI QR સ્કેનરનો સરવાળો જોઈને અહીં ૧ જ વારમાં રકમ લખી લો.',
    ],
    actionGuideEn: [
      'No need to enter 100 individual bills during busy shop hours.',
      'Just check your counter drawer and UPI QR app at the end of the day and save the total in 2 seconds.',
    ],
    exampleGu: 'આજે છૂટક ગલ્લામાં રોકડા ₹5,200 + Google Pay માં ₹3,800 આવ્યા = ₹9,000 સેવ કરો.',
    exampleEn: 'Counter drawer cash ₹5,200 + Google Pay ₹3,800 = Save ₹9,000.',
  },

  customer_sale: {
    id: 'customer_sale',
    titleGu: 'સ્કૂલ / ખાતા વેચાણ (School & Khata Sale)',
    titleEn: 'School & Khata Sale (સ્કૂલ / ખાતા વેચાણ)',
    categoryGu: 'ખાતાવહી / ઉધાર',
    categoryEn: 'Customer Ledger',
    whatIsItGu:
      'સ્કૂલ, કોલેજ, કોચિંગ ક્લાસ, ઓફિસ કે નિયમિત ઉધાર ખરીદતા ગ્રાહકોનું બિલ બનાવવાની એન્ટ્રી.',
    whatIsItEn:
      'Creating invoices and tracking debt ledgers for schools, coaching institutes, and regular credit buyers.',
    actionGuideGu: [
      'ગ્રાહકનું નામ લખો (જો નવો ગ્રાહક હશે તો સિસ્ટમ આપોઆપ નવું ખાતું બનાવી દેશે).',
      'જો ગ્રાહકે થોડા રૂપિયા રોકડા/UPI થી આપ્યા હોય તો તે રકમ "હમણાં મળેલ" માં લખો, બાકીની રકમ આપોઆપ તેના ઉધાર ખાતામાં જમા થઈ જશે.',
    ],
    actionGuideEn: [
      'Type customer/school name (new customers are auto-created automatically).',
      'Enter down-payment in "Received Now", the remainder is automatically charged to their credit ledger.',
    ],
    exampleGu: 'સરદાર પટેલ સ્કૂલ: ₹10,000 ના ચોપડા, ₹2,000 રોકડા આપ્યા, બાકી ₹8,000 ખાતામાં બોલશે.',
    exampleEn: 'Sardar Patel School: ₹10,000 registers, ₹2,000 paid down, ₹8,000 remaining on ledger.',
  },

  cash_close: {
    id: 'cash_close',
    titleGu: 'રોજમેળ મેળવણી / કેશ મેળ (Daily Cash Close)',
    titleEn: 'Daily Cash Close (રોજમેળ મેળવણી)',
    categoryGu: 'રાત્રિ હિસાબ',
    categoryEn: 'Night Audit',
    whatIsItGu:
      'દુકાન બંધ કરતી વખતે ગલ્લામાં પડેલી ભૌતિક રોકડ (૫૦૦, ૨૦૦, ૧૦૦ ની નોટો) ગણીને ગણતરી સાથે મેળવવાની પ્રક્રિયા.',
    whatIsItEn:
      'Counting physical currency notes in the drawer at closing time to ensure no cash is lost or missing.',
    calculationGu: 'અપેક્ષિત કેશ = સવારની કેશ + રોકડ વેચાણ + ઉઘરાણી - વેપારી ચુકવણી - રોકડ ખર્ચ',
    calculationEn: 'Expected Cash = Opening Cash + Cash Sales + Collections − Vendor Payouts − Cash Expenses',
    actionGuideGu: [
      'દરરોજ રાત્રે શટર પાડતા પહેલા ગલ્લાની નોટો ગણીને આ ફોર્મ ભરો.',
      'જો તફાવત 0 આવે તો હિસાબ પાકો છે; જો માઈનસ આવે તો કોઈ ખર્ચ લખવાનો બાકી રહી ગયો છે.',
    ],
    actionGuideEn: [
      'Fill this every night before closing the shop shutter.',
      'If difference is ₹0, drawer is perfectly tallied. If negative, check if any unrecorded cash expense occurred.',
    ],
    exampleGu: 'હિસાબ મુજબ ₹12,500 હોવા જોઈએ, ગલ્લામાં પણ ₹12,500 છે = તફાવત ₹0 (મેળ મળી ગયો).',
    exampleEn: 'Calculated cash ₹12,500, physical notes counted ₹12,500 = Difference ₹0 (Perfect match).',
  },

  collection_rate: {
    id: 'collection_rate',
    titleGu: 'ઉઘરાણી દર (Collection Rate %)',
    titleEn: 'Collection Rate % (ઉઘરાણી દર)',
    categoryGu: 'રીકવરી ઝડપ',
    categoryEn: 'Recovery Metric',
    whatIsItGu:
      'બજારમાં ઉધાર આપેલા રૂપિયામાંથી તમે કેટલા ટકા રકમ પાછી વસૂલ કરી શક્યા છો તેનો સ્કોર (ટકાવારી).',
    whatIsItEn:
      'Percentage score showing how effectively and quickly you are recovering outstanding market credit.',
    calculationGu: 'ઉઘરાણી દર % = (વસૂલ થયેલી ઉઘરાણી ÷ કુલ લેણી રકમ) × 100',
    calculationEn: 'Collection Rate % = (Total Collections Recovered ÷ Total Credit Pool) × 100',
    actionGuideGu: [
      '૭૦% થી વધુ: ખૂબ સરસ ઉઘરાણી છે.',
      '૫૦% થી ઓછું: ઉધાર વધુ ફસાઈ રહ્યો છે; ગ્રાહકોને ફોન કરીને ઉઘરાણી કરવી જરૂરી છે.',
    ],
    actionGuideEn: [
      'Above 70%: Excellent cash recovery.',
      'Below 50%: Too much cash locked in market credit; follow up with overdue customers.',
    ],
    exampleGu: 'કુલ લેવાના ₹50,000 હતા જેમાંથી ₹35,000 આવી ગયા = 70% ઉઘરાણી દર.',
    exampleEn: 'Total ₹50,000 pending pool, recovered ₹35,000 = 70% Collection Rate.',
  },

  operational_position: {
    id: 'operational_position',
    titleGu: 'ઓપરેશનલ કેશ પોઝિશન (Operational Money Position)',
    titleEn: 'Operational Money Position (કેશ પોઝિશન)',
    categoryGu: 'લિક્વિડિટી / સદ્ધરતા',
    categoryEn: 'Working Liquidity',
    whatIsItGu:
      'આજના દિવસે દુકાન પાસે કેટલી રોકડ + ગ્રાહકો પાસેથી લેવાના રૂપિયા છે અને સામે વેપારીઓને કેટલા ચૂકવવાના છે તેનું ચોખ્ખું ચિત્ર.',
    whatIsItEn:
      'Practical liquidity view: Cash in hand + Customer receivables minus Supplier payables.',
    calculationGu: 'નેટ પોઝિશન = ગલ્લાની રોકડ + ગ્રાહકો પાસેથી લેવાના (Receivables) - વેપારીઓને આપવાના (Payables)',
    calculationEn: 'Net Position = Drawer Cash + Customer Receivables − Supplier Payables',
    actionGuideGu: [
      'જો આ આંકડો પ્લસ (+) હોય તો તમારી દુકાન આર્થિક રીતે સુરક્ષિત છે.',
      'જો આ આંકડો માઈનસ (-) હોય તો જૂની ઉઘરાણી તાત્કાલિક વસૂલ કરો જેથી વેપારીઓને સમયસર પેમેન્ટ ચૂકવી શકાય.',
    ],
    actionGuideEn: [
      'If positive (+): Your shop working capital is healthy.',
      'If negative (−): Prioritize recovering overdue customer dues to cover upcoming supplier bills.',
    ],
    exampleGu: 'ગલ્લામાં ₹10,000 + ગ્રાહકો પાસે ₹30,000 લેવાના - વેપારીને ₹25,000 આપવાના = +₹15,000 સદ્ધર.',
    exampleEn: 'Drawer ₹10,000 + Customers owe ₹30,000 − Suppliers owe ₹25,000 = +₹15,000 Healthy.',
  },

  fifo_ageing: {
    id: 'fifo_ageing',
    titleGu: 'ગ્રાહક ઉઘરાણી વિશ્લેષણ - FIFO એજિંગ (Receivable Ageing)',
    titleEn: 'Customer Receivable Ageing (FIFO એજિંગ)',
    categoryGu: 'બાકી મુદત',
    categoryEn: 'Ageing Buckets',
    whatIsItGu:
      'ગ્રાહકો પાસેથી લેવાના રૂપિયા કેટલા દિવસ જૂના છે તેનું ૪ ભાગમાં વિભાજન (૦-૭ દિવસ, ૮-૩૦ દિવસ, ૩૧-૬૦ દિવસ, ૬૦+ દિવસ).',
    whatIsItEn:
      'Breaks down customer unpaid dues into 4 time buckets: 0-7 days (Fresh), 8-30 days, 31-60 days, and 60+ days (Overdue).',
    actionGuideGu: [
      '🟢 ૦-૭ દિવસ (તાજું બિલ): ચિંતા કરવાની જરૂર નથી.',
      '🟡 ૮-૩૦ દિવસ: સામાન્ય ક્રેડિટ સાયકલ.',
      '🟠 ૩૧-૬૦ દિવસ: ગ્રાહકને યાદ અપાવો (વોટ્સએપ સ્ટેટમેન્ટ મોકલો).',
      '🔴 ૬૦+ દિવસ: ગંભીર બાકી રકમ; તાત્કાલિક ફોન કરો અથવા દુકાને જઈને મળો.',
    ],
    actionGuideEn: [
      '🟢 0-7 Days: Fresh bills, normal flow.',
      '🟡 8-30 Days: Standard credit cycle.',
      '🟠 31-60 Days: Send WhatsApp reminder/statement.',
      '🔴 60+ Days Overdue: High priority, make direct phone call or visit.',
    ],
    exampleGu: 'સરદાર પટેલ હાઈસ્કૂલનું ₹22,500 નું બિલ 33 દિવસથી બાકી છે (31-60 દિવસમાં બોલે છે).',
    exampleEn: 'Sardar Patel High School bill of ₹22,500 pending for 33 days (in 31-60 days bucket).',
  },

  approx_profit: {
    id: 'approx_profit',
    titleGu: 'અંદાજિત નફો (Approximate Profit)',
    titleEn: 'Approximate Profit (અંદાજિત નફો)',
    categoryGu: 'નફા-નુકસાન અંદાજ',
    categoryEn: 'Rough Estimate',
    whatIsItGu:
      'દુકાનની દૈનિક આવક અને જાવક પરથી કાઢેલો અંદાજિત ઓપરેશનલ નફો.',
    whatIsItEn:
      'Rough operational business indicator calculated from Sales minus Purchases minus Expenses.',
    calculationGu: 'અંદાજિત નફો = કુલ વેચાણ - માલની ખરીદી - દુકાન ખર્ચ',
    calculationEn: 'Approx Profit = Total Sales − Stock Purchases − Store Expenses',
    actionGuideGu: [
      'આ ચોખ્ખો ઓડિટેડ નફો નથી, પણ રોજીંદો ધંધો કેવો ચાલે છે તેનો ત્વરિત અંદાજ આપે છે.',
    ],
    actionGuideEn: [
      'This is an operational rule-of-thumb estimate, not an audited COGS net margin.',
    ],
    exampleGu: 'આ મહિને વેચાણ ₹1,20,000 - ખરીદી ₹85,000 - ખર્ચ ₹12,000 = અંદાજે ₹23,000 નફો.',
    exampleEn: 'This month Sales ₹1,20,000 − Purchases ₹85,000 − Expenses ₹12,000 = Approx ₹23,000 Profit.',
  },

  needs_attention: {
    id: 'needs_attention',
    titleGu: 'ધ્યાન આપવાની જરૂરિયાત (Needs Attention Alerts)',
    titleEn: 'Needs Attention Alerts (ધ્યાન આપો)',
    categoryGu: 'ચેતવણી / નોટિસ',
    categoryEn: 'Smart Alerts',
    whatIsItGu:
      'સિસ્ટમ આપોઆપ શોધીને બતાવે છે કે આજે કયા ગ્રાહકને ફોન કરવાનો છે, કોની મુદત વીતી ગઈ છે અને વેપારીને ક્યારે ચૂકવવાના છે.',
    whatIsItEn:
      'Automated intelligence flags customer debts overdue >30 days, promises due today, credit limits exceeded, and vendor payment deadlines.',
    actionGuideGu: [
      'અહીં દેખાતા કાર્ડ પર "ફોન કરો", "ઉઘરાણી જમા" અથવા "વાયદો આપો" બટન દબાવીને ત્વરિત કામ પતાવો.',
    ],
    actionGuideEn: [
      'Use the 1-tap "Call", "Receive Payment", or "Promise to Pay" action buttons on each alert.',
    ],
    exampleGu: 'સરદાર પટેલ હાઈસ્કૂલ: 33 દિવસથી બાકી (₹22,500) - આજે જ ફોન કરો.',
    exampleEn: 'Sardar Patel High School: 33 days overdue (₹22,500) - Call today.',
  },

  google_sheets: {
    id: 'google_sheets',
    titleGu: 'ગૂગલ શીટ્સ ડેટાબેઝ (Google Sheets Database)',
    titleEn: 'Google Sheets Database (ગૂગલ શીટ્સ)',
    categoryGu: 'ડેટાબેઝ સિંક',
    categoryEn: 'Cloud Storage',
    whatIsItGu:
      'તમારા મોબાઇલ અને કમ્પ્યુટર પરનો તમામ હિસાબ તમારી પોતાની ગૂગલ શીટમાં આપોઆપ લાઈવ સિંક થાય છે.',
    whatIsItEn:
      'All sales, customers, ledgers, and cash closes are automatically synchronized to your personal Google Spreadsheet in real time.',
    actionGuideGu: [
      'જો ઇન્ટરનેટ ન હોય તો પણ ઍપ કામ કરશે (ઓફલાઇન). જેવું નેટ આવશે એટલે બધો ડેટા શીટમાં સિંક થઈ જશે.',
      'સેટિંગ્સ ➔ "ગૂગલ શીટ્સ મેનેજ કરો" માં જઈને કનેક્શન ચકાસી શકો છો.',
    ],
    actionGuideEn: [
      'Works 100% offline. Automatically pushes queued changes to Google Sheets when online.',
      'Test your connection anytime in Settings ➔ Manage Sheets Sync.',
    ],
    exampleGu: 'દુકાનમાં લાઇટ/નેટ ગયું હોય તો પણ વેચાણ નોંધી શકાય છે, નેટ આવતા શીટમાં આપોઆપ અપડેટ થઈ જશે.',
    exampleEn: 'Even if power/Wi-Fi drops at the shop, billing continues offline and syncs when back online.',
  },
};
