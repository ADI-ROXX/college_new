// frontend/pages/events/index.js
import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance'; // Updated import
import { useRouter } from 'next/router';

export default function Events() {
  const [events, setEvents] = useState([]);
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events'); // Updated endpoint
      setEvents(response.data);
    } catch (error) {
      alert('Failed to fetch events. Please login again.');
      router.push('/login');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    const eventName = prompt('Enter Event Name');
    if (!eventName) return;
    try {
      await axios.post('/add_event', { name: eventName }); // Updated endpoint
      fetchEvents();
    } catch (error) {
      alert('Failed to add event.');
    }
  };

  const handleSeeBills = (eventName) => {
    router.push(`/add/${encodeURIComponent(eventName)}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Events</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={handleAddEvent}
      >
        Add an Event
      </button>
      <table className="w-full table-auto border">
        <thead>
          <tr>
            <th className="border px-4 py-2">S.No.</th>
            <th className="border px-4 py-2">Event Name</th>
            <th className="border px-4 py-2">See Bills</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event._id}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{event.name}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => handleSeeBills(event.name)}
                >
                  See Bills
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
