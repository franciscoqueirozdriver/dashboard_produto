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
    console.error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    return [];
  }

  const json = await response.json();
  return json.value || [];
}

export async function getSpotterDataset() {
  const baseParams = {
    $filter: `createdDate ge 2023-01-01 and createdDate le 2023-12-31`,
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
