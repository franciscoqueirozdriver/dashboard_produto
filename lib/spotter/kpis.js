const MONTH_NAMES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function getMonthKey(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key) {
  if (!key) return '';
  const [year, month] = key.split('-');
  const monthIndex = Number.parseInt(month, 10) - 1;
  const label = MONTH_NAMES[monthIndex] ?? month;
  return `${label.toUpperCase()} ${year.slice(-2)}`;
}

function getLastMonthsKeys(total = 12) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const keys = [];
  for (let index = total - 1; index >= 0; index -= 1) {
    const clone = new Date(date);
    clone.setMonth(date.getMonth() - index);
    keys.push(getMonthKey(clone));
  }
  return keys;
}

function buildProductsDictionary(productsDictionary) {
  const map = new Map();
  for (const item of productsDictionary ?? []) {
    const id = item?.id ?? item?.productId ?? item?.code;
    const name = item?.name ?? item?.description ?? item?.title;
    if (id && name) {
      map.set(String(id), name);
    }
  }
  return map;
}

function resolveProductName(product, dictionary) {
  if (!product) return 'Produto';
  const name =
    product.name ??
    product.productName ??
    product.title ??
    (product.code && dictionary.get(String(product.code))) ??
    (product.id && dictionary.get(String(product.id)));
  if (name) return name;
  if (product.id) return `Produto ${product.id}`;
  return 'Produto não identificado';
}

function toNumber(value) {
  const parsed = Number.parseFloat(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getLeadIdentifier(entity) {
  return (
    entity?.id ??
    entity?.leadId ??
    entity?.leadID ??
    entity?.lead?.id ??
    entity?.lead?.leadId ??
    null
  );
}



export function buildDataset({ leads = [], leadsSold = [], losts = [], productsDictionary = [], recommendedProducts = [], products = [] }) {
  const dictionary = buildProductsDictionary(products);
  const soldByLead = new Map();
  const lostByLead = new Map();
  const salesProducts = [];
  const lostProducts = [];
  const leadProducts = new Map(); // Mantendo a declaração para evitar erro de referência, mas será vazio.

  // Dicionário de produtos recomendados (leadId -> productId)
  const recommendedProductsMap = new Map();
  for (const rp of recommendedProducts) {
    if (rp.leadId && rp.productId) {
      recommendedProductsMap.set(String(rp.leadId), String(rp.productId));
    }
  }

  for (const sale of leadsSold) {
    if (!sale?.leadId) continue;
    soldByLead.set(String(sale.leadId), sale);
    const product = sale.products?.[0]; // Pega o primeiro produto vendido
    const productName = product ? resolveProductName(product, dictionary) : 'Sem produto vendido';

    salesProducts.push({
      leadId: sale.leadId,
      saleDate: sale.saleDate,
      product: productName,
      finalValue: toNumber(sale.totalDealValue), // Usando totalDealValue como fallback
    });
  }

  for (const lost of losts) {
    if (!lost?.leadId) continue;
    lostByLead.set(String(lost.leadId), lost);

    const recommendedProductId = recommendedProductsMap.get(String(lost.leadId));
    const productName = recommendedProductId ? dictionary.get(recommendedProductId) : 'Sem produto recomendado';

    lostProducts.push({
      leadId: lost.leadId,
      date: lost.date,
      product: productName ?? 'Sem produto recomendado',
      reason: lost.reason ?? 'Sem motivo informado',
    });
  }

  return {
    leads,
    leadsSold,
    losts,
    dictionary,
    soldByLead,
    lostByLead,
    salesProducts,
    lostProducts,
    leadProducts: new Map(), // Retorna um mapa vazio para manter a compatibilidade
  };
}

function getLeadStatus(leadId, { soldByLead, lostByLead }) {
  if (leadId === undefined || leadId === null) {
    return 'open';
  }
  const id = String(leadId);
  if (soldByLead.has(id)) return 'won';
  if (lostByLead.has(id)) return 'lost';
  return 'open';
}

export function getSummary(dataset) {
  const { leads, leadsSold } = dataset;
  const totalSales = leadsSold.length;
  const revenue = leadsSold.reduce((total, sale) => total + toNumber(sale.totalDealValue), 0);
  const averageTicket = totalSales ? revenue / totalSales : 0;
  const leadsCreated = leads.length;
  const statusCounts = { won: 0, lost: 0, open: 0 };

  for (const lead of leads) {
    const status = getLeadStatus(getLeadIdentifier(lead), dataset);
    statusCounts[status] += 1;
  }

  const totalStatus = statusCounts.won + statusCounts.lost + statusCounts.open || 1;

  const winRate = statusCounts.won / totalStatus;
  const lossRate = statusCounts.lost / totalStatus;

  return {
    totalSales,
    revenue,
    averageTicket,
    leadsCreated,
    winRate,
    lossRate,
    statusCounts,
  };
}

export function getPerformanceByMonth(dataset) {
  const months = getLastMonthsKeys();
  const monthData = months.reduce((acc, key) => {
    acc[key] = { key, label: getMonthLabel(key), revenue: 0, deals: 0 };
    return acc;
  }, {});

  for (const sale of dataset.leadsSold) {
    const key = getMonthKey(sale.saleDate);
    if (!key || !monthData[key]) continue;
    monthData[key].revenue += toNumber(sale.totalDealValue);
    monthData[key].deals += 1;
  }

  return months.map((key) => monthData[key]);
}

export function getStatusByProduct(dataset) {
  const statusByProduct = new Map();

  function ensure(product) {
    if (!statusByProduct.has(product)) {
      statusByProduct.set(product, { product, won: 0, lost: 0, open: 0 });
    }
    return statusByProduct.get(product);
  }

  for (const saleProduct of dataset.salesProducts) {
    ensure(saleProduct.product).won += 1;
  }

  for (const lostProduct of dataset.lostProducts) {
    ensure(lostProduct.product).lost += 1;
  }

  // Associar Produto Recomendado a leads abertos
  for (const lead of dataset.leads) {
    const status = getLeadStatus(getLeadIdentifier(lead), dataset);
    if (status !== 'open') continue;

    const leadId = getLeadIdentifier(lead);
    if (!leadId) continue;

    // Acessar o mapa de produtos recomendados criado em buildDataset
    const recommendedProductId = dataset.recommendedProductsMap.get(String(leadId));
    const productName = recommendedProductId ? dataset.dictionary.get(recommendedProductId) : 'Sem produto recomendado';

    ensure(productName ?? 'Sem produto recomendado').open += 1;
  }

  return Array.from(statusByProduct.values()).sort((a, b) => b.won - a.won);
}

export function getTopProducts(dataset, limit = 10) {
  const totals = new Map();
  for (const product of dataset.salesProducts) {
    const entry = totals.get(product.product) ?? { product: product.product, revenue: 0, deals: 0 };
    entry.revenue += toNumber(product.finalValue);
    entry.deals += 1;
    totals.set(product.product, entry);
  }
  return Array.from(totals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getAverageTicketByProduct(dataset) {
  const aggregates = new Map();
  for (const product of dataset.salesProducts) {
    const entry = aggregates.get(product.product) ?? { product: product.product, revenue: 0, deals: 0 };
    entry.revenue += toNumber(product.finalValue);
    entry.deals += 1;
    aggregates.set(product.product, entry);
  }
  return Array.from(aggregates.values())
    .filter((entry) => entry.deals > 0)
    .map((entry) => ({ product: entry.product, ticket: entry.revenue / entry.deals }))
    .sort((a, b) => b.ticket - a.ticket);
}

export function getDiscardReasons(dataset) {
  const reasons = new Map();
  for (const product of dataset.lostProducts) {
    const key = product.product;
    if (!reasons.has(key)) {
      reasons.set(key, { product: key, reasons: new Map(), total: 0 });
    }
    const entry = reasons.get(key);
    const label = product.reason ?? 'Sem motivo informado';
    entry.total += 1;
    entry.reasons.set(label, (entry.reasons.get(label) ?? 0) + 1);
  }

  return Array.from(reasons.values()).map((entry) => ({
    product: entry.product,
    total: entry.total,
    breakdown: Array.from(entry.reasons.entries()).map(([reason, count]) => ({ reason, count })),
  }));
}

export function getPerformanceLine(dataset) {
  const performance = getPerformanceByMonth(dataset);
  return performance.map((item) => ({ label: item.label, value: item.revenue }));
}

export function getStatusTrend(dataset) {
  const months = getLastMonthsKeys();
  const trend = months.reduce((acc, key) => {
    acc[key] = { label: getMonthLabel(key), won: 0, lost: 0, open: 0 };
    return acc;
  }, {});

  for (const sale of dataset.leadsSold) {
    const key = getMonthKey(sale.saleDate);
    if (!key || !trend[key]) continue;
    trend[key].won += 1;
  }

  for (const lost of dataset.losts) {
    const key = getMonthKey(lost.date);
    if (!key || !trend[key]) continue;
    trend[key].lost += 1;
  }

  for (const lead of dataset.leads) {
    const status = getLeadStatus(lead.id ?? lead.leadId, dataset);
    if (status !== 'open') continue;
    const key = getMonthKey(lead.registerDate ?? lead.createdAt);
    if (!key || !trend[key]) continue;
    trend[key].open += 1;
  }

  return months.map((key) => trend[key]);
}
