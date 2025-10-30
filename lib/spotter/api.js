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

  const baseParams = {
    $filter: `createdDate ge ${yearAgoStr} and createdDate le ${todayStr}`,
    $count: true,
  };

  const leads = await fetchSpotter('/Leads', {
    ...baseParams,
    $select: 'leadId,status,value,createdDate,product,origin',
  });
  const leadsSold = await fetchSpotter('/LeadsSold', {
    ...baseParams,
    $select: 'leadId,value,createdDate,product,origin',
  });
  const losts = await fetchSpotter('/LeadsLost', {
    ...baseParams,
    $select: 'leadId,lostDate,lostReason',
  });
  const productsDictionary = await fetchSpotter('/Products', {
    $select: 'name,productId',
  });

  return { leads, leadsSold, losts, productsDictionary };
}
