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
    if (response.status === 401 || response.status === 403) {
      console.warn(`[SPOTTER] API request returned ${response.status} for ${endpoint}. Returning empty dataset.`);
      return [];
    }
    
    const errorText = await response.text();
    console.error(
      `[SPOTTER] API request failed for ${endpoint} with status ${response.status}:`,
      errorText
    );
    throw new Error(
      `API request failed for ${endpoint} with status ${response.status}. Response: ${errorText.substring(0, 50)}...`
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (e) {
    // Se falhar o JSON parse, significa que a resposta não era JSON (ex: HTML de erro)
    // Se o status for 200, é um erro de API que retorna HTML.
    const errorText = await response.text();
    console.error(
      `[SPOTTER] Failed to parse JSON for ${endpoint}. Status: ${response.status}. Response text starts with: ${errorText.substring(0, 50)}...`,
      e
    );
    throw new Error(
      `Failed to parse JSON for ${endpoint}. Status: ${response.status}. Response was not JSON. Full response: ${errorText.substring(0, 200)}...`
    );
  }

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
  const losts = await fetchSpotter('/LeadsDiscarded', {
    $filter: `date ge ${yearAgoStr} and date le ${todayStr}`,
    $count: true,
    $select: 'leadId,date,reason',
  });
  const productsDictionary = await fetchSpotter('/Products', {
    $select: 'name,productId',
  });

  return { leads, leadsSold, losts, productsDictionary };
}
