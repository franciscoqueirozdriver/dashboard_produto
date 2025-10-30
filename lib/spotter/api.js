const TOKEN_EXACT = process.env.TOKEN_EXACT;
const API_URL = 'https://api.exactspotter.com/v3';

async function fetchSpotter(endpoint, params) {
  const url = new URL(`${API_URL}${endpoint}`);
  url.search = new URLSearchParams(params).toString();
  console.log(`Fetching: ${url}`);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token_exact': TOKEN_EXACT,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[SPOTTER] API request failed for ${endpoint} with status ${response.status}:`,
      errorText
    );
    throw new Error(
      `API request failed for ${endpoint} with status ${response.status}`
    );
  }

  const json = await response.json();
  return json.value || [];
}

export async function getSpotterDataset() {
  const today = new Date();
  const yearAgo = new Date();
  yearAgo.setFullYear(today.getFullYear() - 1);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDate(today);
  const yearAgoStr = formatDate(yearAgo);

  const leads = await fetchSpotter('/Leads', {
    $filter: `registerDate ge ${yearAgoStr} and registerDate le ${todayStr}`,
    $count: true,
    $select: 'id,registerDate,leadProduct,source',
  });
  const leadsSold = await fetchSpotter('/LeadsSold', {
    $filter: `saleDate ge ${yearAgoStr} and saleDate le ${todayStr}`,
    $count: true,
    $select: 'leadId,saleDate,totalDealValue,products',
  });
  const losts = await fetchSpotter('/LeadsLost', {
    $filter: `date ge ${yearAgoStr} and date le ${todayStr}`,
    $count: true,
    $select: 'leadId,date,reason',
  });
  const productsDictionary = await fetchSpotter('/Products', {
    $select: 'name,productId',
  });

  return { leads, leadsSold, losts, productsDictionary };
}
