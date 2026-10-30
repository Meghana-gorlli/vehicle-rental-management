
import { useEffect, useState } from "react";
import * as api from "./services/api";
import "./index.css";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [message, setMessage] = useState("");

  const [vehicle, setVehicle] = useState({
    name: "",
    type: "Car",
    pricePerDay: ""
  });

  const [customer, setCustomer] = useState({
    name: "",
    phone: ""
  });

  const [booking, setBooking] = useState({
    vehicleId: "",
    customerId: "",
    startDate: "",
    endDate: ""
  });

  async function loadData() {
    try {
      const [v, c, r] = await Promise.all([
        api.getVehicles(),
        api.getCustomers(),
        api.getRentals()
      ]);
      setVehicles(v);
      setCustomers(c);
      setRentals(r);
    } catch {
      setMessage("Start JSON Server on port 3000 and refresh.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addVehicle(e) {
    e.preventDefault();
    try {
      await api.addVehicle({
        ...vehicle,
        pricePerDay: Number(vehicle.pricePerDay),
        available: true
      });
      setVehicle({ name: "", type: "Car", pricePerDay: "" });
      setMessage("Vehicle added successfully!");
      loadData();
    } catch {
      setMessage("Could not add vehicle.");
    }
  }

  async function deleteVehicle(id) {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await api.deleteVehicle(id);
      setMessage("Vehicle deleted.");
      loadData();
    } catch {
      setMessage("Could not delete vehicle.");
    }
  }

  async function addCustomer(e) {
    e.preventDefault();
    try {
      await api.addCustomer(customer);
      setCustomer({ name: "", phone: "" });
      setMessage("Customer added successfully!");
      loadData();
    } catch {
      setMessage("Could not add customer.");
    }
  }

  async function bookRental(e) {
    e.preventDefault();

    const selectedVehicle = vehicles.find(
      v => String(v.id) === String(booking.vehicleId)
    );
    const selectedCustomer = customers.find(
      c => String(c.id) === String(booking.customerId)
    );

    if (!selectedVehicle || !selectedCustomer) {
      setMessage("Select a customer and a vehicle.");
      return;
    }

    const start = new Date(booking.startDate + "T00:00:00");
    const end = new Date(booking.endDate + "T00:00:00");
    const days = Math.round((end - start) / 86400000);

    if (!booking.startDate || !booking.endDate || days <= 0) {
      setMessage("Choose valid dates. End date must be after start date.");
      return;
    }

    if (!selectedVehicle.available) {
      setMessage("This vehicle is unavailable.");
      return;
    }

    const totalAmount = days * Number(selectedVehicle.pricePerDay);

    try {
      await api.addRental({
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        startDate: booking.startDate,
        endDate: booking.endDate,
        days,
        totalAmount,
        status: "Booked"
      });

      await api.updateVehicle(selectedVehicle.id, {
        ...selectedVehicle,
        available: false
      });

      setBooking({
        vehicleId: "",
        customerId: "",
        startDate: "",
        endDate: ""
      });

      setMessage(`Booking successful! Total: ₹${totalAmount}`);
      loadData();
    } catch {
      setMessage("Booking failed. Check JSON Server.");
    }
  }

  async function returnRental(rental) {
    try {
      await api.updateRental(rental.id, {
        ...rental,
        status: "Returned"
      });

      const v = vehicles.find(
        item => String(item.id) === String(rental.vehicleId)
      );

      if (v) {
        await api.updateVehicle(v.id, { ...v, available: true });
      }

      setMessage("Vehicle returned successfully.");
      loadData();
    } catch {
      setMessage("Could not return vehicle.");
    }
  }

  const money = value =>
    "₹" + Number(value || 0).toLocaleString("en-IN");

  const revenue = rentals
    .filter(r => r.status !== "Cancelled")
    .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🚘 DriveEase</h2>
        <p>VEHICLE RENTAL PORTAL</p>

        {["Dashboard", "Vehicles", "Customers", "Rentals"].map(item => (
          <button
            key={item}
            className={page === item ? "nav active" : "nav"}
            onClick={() => {
              setPage(item);
              setMessage("");
            }}
          >
            {item}
          </button>
        ))}
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <p>VEHICLE RENTAL MANAGEMENT</p>
            <h1>{page}</h1>
          </div>
          <span className="admin">Administrator</span>
        </header>

        {message && (
          <div className="message">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {page === "Dashboard" && (
          <>
            <section className="welcome">
              <p>WELCOME TO DRIVE EASE</p>
              <h2>Manage your fleet with ease.</h2>
              <span>Vehicles, customers and bookings in one place.</span>
              <div className="car">🚙 🚗</div>
            </section>

            <section className="stats">
              <div className="stat">
                <span>Total Vehicles</span>
                <h2>{vehicles.length}</h2>
              </div>
              <div className="stat">
                <span>Available Vehicles</span>
                <h2>{vehicles.filter(v => v.available).length}</h2>
              </div>
              <div className="stat">
                <span>Total Customers</span>
                <h2>{customers.length}</h2>
              </div>
              <div className="stat">
                <span>Total Rentals</span>
                <h2>{rentals.length}</h2>
              </div>
            </section>

            <section className="panel">
              <h2>Rental Summary</h2>
              <p>Total rental value</p>
              <h2 className="revenue">{money(revenue)}</h2>
              <button className="primary" onClick={() => setPage("Rentals")}>
                Create a Booking
              </button>
            </section>
          </>
        )}

        {page === "Vehicles" && (
          <section className="panel">
            <h2>Add New Vehicle</h2>
            <form onSubmit={addVehicle} className="form">
              <label>Vehicle Name</label>
              <input required placeholder="e.g. Honda City"
                value={vehicle.name}
                onChange={e => setVehicle({...vehicle, name:e.target.value})}
              />

              <label>Vehicle Type</label>
              <select value={vehicle.type}
                onChange={e => setVehicle({...vehicle, type:e.target.value})}>
                <option>Car</option>
                <option>SUV</option>
                <option>Sedan</option>
                <option>Bike</option>
                <option>Van</option>
              </select>

              <label>Price Per Day (₹)</label>
              <input required type="number" min="1" placeholder="1500"
                value={vehicle.pricePerDay}
                onChange={e => setVehicle({...vehicle, pricePerDay:e.target.value})}
              />
              <button className="primary">Add Vehicle</button>
            </form>

            <h2>Vehicle List</h2>
            <div className="cards">
              {vehicles.map(v => (
                <article className="vehicle-card" key={v.id}>
                  <div className="vehicle-icon">🚘</div>
                  <h3>{v.name}</h3>
                  <p>{v.type}</p>
                  <h3>{money(v.pricePerDay)} / day</h3>
                  <span className={v.available ? "available" : "unavailable"}>
                    {v.available ? "Available" : "Unavailable"}
                  </span>
                  <button className="danger"
                    onClick={() => deleteVehicle(v.id)}>Delete</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === "Customers" && (
          <section className="panel">
            <h2>Add New Customer</h2>
            <form onSubmit={addCustomer} className="form">
              <label>Customer Name</label>
              <input required placeholder="Full name"
                value={customer.name}
                onChange={e => setCustomer({...customer, name:e.target.value})}
              />
              <label>Phone Number</label>
              <input required placeholder="Phone number"
                value={customer.phone}
                onChange={e => setCustomer({...customer, phone:e.target.value})}
              />
              <button className="primary">Add Customer</button>
            </form>

            <h2>Customer List</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Phone</th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {page === "Rentals" && (
          <>
            <section className="panel">
              <h2>Create Rental Booking</h2>
              <form onSubmit={bookRental} className="form">
                <label>Customer</label>
                <select required value={booking.customerId}
                  onChange={e => setBooking({...booking, customerId:e.target.value})}>
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <label>Available Vehicle</label>
                <select required value={booking.vehicleId}
                  onChange={e => setBooking({...booking, vehicleId:e.target.value})}>
                  <option value="">Select vehicle</option>
                  {vehicles.filter(v => v.available).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {money(v.pricePerDay)}/day
                    </option>
                  ))}
                </select>

                <label>Start Date</label>
                <input required type="date" value={booking.startDate}
                  onChange={e => setBooking({...booking, startDate:e.target.value})}/>

                <label>End Date</label>
                <input required type="date" min={booking.startDate}
                  value={booking.endDate}
                  onChange={e => setBooking({...booking, endDate:e.target.value})}/>

                {booking.startDate && booking.endDate && (() => {
                  const days = Math.round(
                    (new Date(booking.endDate + "T00:00:00") -
                     new Date(booking.startDate + "T00:00:00")) / 86400000
                  );
                  const v = vehicles.find(
                    item => String(item.id) === String(booking.vehicleId)
                  );
                  return days > 0 && v ? (
                    <p className="estimate">
                      {days} days × {money(v.pricePerDay)} ={" "}
                      <strong>{money(days * Number(v.pricePerDay))}</strong>
                    </p>
                  ) : null;
                })()}

                <button className="primary">Confirm Booking</button>
              </form>
            </section>

            <section className="panel">
              <h2>Rental Transactions</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Customer</th><th>Vehicle</th><th>Days</th>
                      <th>Amount</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {rentals.map(r => (
                      <tr key={r.id}>
                        <td>{r.customerName}</td>
                        <td>{r.vehicleName}</td>
                        <td>{r.days}</td>
                        <td>{money(r.totalAmount)}</td>
                        <td>{r.status}</td>
                        <td>{r.status === "Booked" &&
                          <button className="secondary"
                            onClick={() => returnRental(r)}>Return</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <footer>DriveEase | React JS + JSON Server</footer>
      </main>
    </div>
  );
}

export default App;
