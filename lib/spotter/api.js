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

  // Lê o corpo da resposta APENAS UMA VEZ
  const responseBody = await response.text();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Se for erro de autenticação/autorização, retorna array vazio para não quebrar o build/app
      console.warn(`[SPOTTER] API request returned ${response.status} for ${endpoint}. Returning empty dataset. Response text: ${responseBody.substring(0, 50)}...`);
      return [];
    }
    
    console.error(
      `[SPOTTER] API request failed for ${endpoint} with status ${response.status}:`,
      responseBody
    );
    throw new Error(
      `API request failed for ${endpoint} with status ${response.status}. Response: ${responseBody.substring(0, 50)}...`
    );
  }

  let json;
  try {
    // Tenta fazer o parse JSON a partir do corpo lido
    json = JSON.parse(responseBody);
  } catch (e) {
    // Se falhar o JSON parse, significa que a resposta não era JSON (ex: HTML de erro)
    console.error(
      `[SPOTTER] Failed to parse JSON for ${endpoint}. Status: ${response.status}. Response text starts with: ${responseBody.substring(0, 50)}...`,
      e
    );
    throw new Error(
      `Failed to parse JSON for ${endpoint}. Status: ${response.status}. Response was not JSON. Full response: ${responseBody.substring(0, 200)}...`
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
