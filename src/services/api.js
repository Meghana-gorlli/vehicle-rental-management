
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// Get all vehicles
export async function getVehicles() {
  const response = await fetch(`${API_URL}/vehicles`);
  if (!response.ok) throw new Error("Failed to load vehicles");
  return response.json();
}

// Add a vehicle
export async function addVehicle(vehicle) {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) throw new Error("Failed to add vehicle");
  return response.json();
}

// Delete a vehicle
export async function deleteVehicle(id) {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete vehicle");
  return response;
}

// Get all customers
export async function getCustomers() {
  const response = await fetch(`${API_URL}/customers`);
  if (!response.ok) throw new Error("Failed to load customers");
  return response.json();
}

// Add a customer
export async function addCustomer(customer) {
  const response = await fetch(`${API_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });

  if (!response.ok) throw new Error("Failed to add customer");
  return response.json();
}

// Get all rentals
export async function getRentals() {
  const response = await fetch(`${API_URL}/rentals`);
  if (!response.ok) throw new Error("Failed to load rentals");
  return response.json();
}

// Add a rental
export async function addRental(rental) {
  const response = await fetch(`${API_URL}/rentals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rental),
  });

  if (!response.ok) throw new Error("Failed to add rental");
  return response.json();
}

// Update a vehicle
export async function updateVehicle(id, vehicle) {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) throw new Error("Failed to update vehicle");
  return response.json();
}

// Update a rental
export async function updateRental(id, rental) {
  const response = await fetch(`${API_URL}/rentals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rental),
  });

  if (!response.ok) throw new Error("Failed to update rental");
  return response.json();
}
