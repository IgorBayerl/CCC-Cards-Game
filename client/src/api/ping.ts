import api from '~/services/api'
  
export async function fetchConnectionStatus () {
  try {
    const response = await api.get('/ping');
    // Assuming the endpoint returns a 200 status for a successful connection
    if (response.status === 200) {
      return 'connected';
    } else {
      // Handle any other statuses as needed
      return 'disconnected';
    }
  } catch (error) {
    // If the request fails, consider the status as disconnected
    return 'disconnected';
  }
}