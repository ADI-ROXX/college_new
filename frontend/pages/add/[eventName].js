// frontend/pages/add/[eventName].js
import React, { useState, useEffect, useRef } from 'react'
import axios, {
  NEXT_PUBLIC_BACKEND_URL,
  NEXT_PUBLIC_PYTHON_BACKEND_URL
} from '../../utils/axiosInstance'
import { useRouter } from 'next/router'

export default function AddBill() {
  const router = useRouter()
  const { eventName } = router.query

  // Form state
  const [form, setForm] = useState({
    billName: '',
    description: '',
    amount: '',
    isAvailable: false // Add this line
  })

  // Bills list
  const [bills, setBills] = useState([])

  // Dynamic file input state for Image 1
  const [image1Inputs, setImage1Inputs] = useState([{ id: 0 }])
  const [image1Files, setImage1Files] = useState({})
  const [image1Previews, setImage1Previews] = useState({})
  const [image1InputRefs, setImage1InputRefs] = useState({})
  const [image2InputRefs, setImage2InputRefs] = useState({})
  // Dynamic file input state for Image 2
  const [image2Inputs, setImage2Inputs] = useState([{ id: 0 }])
  const [image2Files, setImage2Files] = useState({})
  const [image2Previews, setImage2Previews] = useState({})

  // Image Modal state
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImages, setModalImages] = useState([])

  // Preview Modal state
  const [currentPreviewImage, setCurrentPreviewImage] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Fetch bills for the event
  // Fetch bills for the event
  const fetchBills = async () => {
    try {
      const response = await axios.get(
        `/events/${encodeURIComponent(eventName)}/bills`
      )
      setBills(response.data)
      console.log(response.data)
    } catch (error) {
      console.error('Failed to fetch bills:', error)
      alert('Failed to fetch bills.')
    }
  }

  useEffect(() => {
    if (eventName) fetchBills()
  }, [eventName])
  const removeImage1Input = (id) => {
    setImage1Inputs(image1Inputs.filter((input) => input.id !== id))
    const updatedFiles = { ...image1Files }
    delete updatedFiles[id]
    setImage1Files(updatedFiles)

    const updatedPreviews = { ...image1Previews }
    delete updatedPreviews[id]
    setImage1Previews(updatedPreviews)

    const updatedRefs = { ...image1InputRefs }
    delete updatedRefs[id]
    setImage1InputRefs(updatedRefs)
  }
  const removeImage2Input = (id) => {
    setImage2Inputs(image2Inputs.filter((input) => input.id !== id))
    const updatedFiles = { ...image2Files }
    delete updatedFiles[id]
    setImage2Files(updatedFiles)

    const updatedPreviews = { ...image2Previews }
    delete updatedPreviews[id]
    setImage2Previews(updatedPreviews)

    const updatedRefs = { ...image2InputRefs }
    delete updatedRefs[id]
    setImage2InputRefs(updatedRefs)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle changes in Image 1 inputs
  const handleImage1Change = (e, id) => {
    const files = e.target.files
    setImage1Files({
      ...image1Files,
      [id]: files
    })

    // Generate preview URL
    if (files && files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage1Previews({
          ...image1Previews,
          [id]: event.target.result
        })
      }
      reader.readAsDataURL(files[0])
    }
  }

  // Handle changes in Image 2 inputs
  const handleImage2Change = (e, id) => {
    const files = e.target.files
    setImage2Files({
      ...image2Files,
      [id]: files
    })

    // Generate preview URL
    if (files && files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage2Previews({
          ...image2Previews,
          [id]: event.target.result
        })
      }
      reader.readAsDataURL(files[0])
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('billName', form.billName)
    data.append('description', form.description)
    data.append('amount', form.amount)
    data.append('isAvailable', form.isAvailable) // Add this line
    // Append all Image 1 files
    Object.values(image1Files).forEach((files) => {
      Array.from(files).forEach((file) => {
        data.append('images1', file)
      })
    })

    // Append all Image 2 files
    Object.values(image2Files).forEach((files) => {
      Array.from(files).forEach((file) => {
        data.append('images2', file)
      })
    })

    try {
      await axios.post(`/events/${encodeURIComponent(eventName)}/bills`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // Reset form and state
      setForm({ billName: '', description: '', amount: '' })
      setImage1Inputs([{ id: 0 }])
      setImage1Files({})
      setImage1Previews({})
      setImage2Inputs([{ id: 0 }])
      setImage2Files({})
      setImage2Previews({})
      // Clear image input refs for Image1
      Object.values(image1InputRefs).forEach((inputRef) => {
        if (inputRef) {
          inputRef.value = ''
        }
      })

      // Clear image input refs for Image2
      Object.values(image2InputRefs).forEach((inputRef) => {
        if (inputRef) {
          inputRef.value = ''
        }
      })

      // Reset input refs
      setImage1InputRefs({})
      setImage2InputRefs({})

      fetchBills()
      alert('Bill added successfully')
    } catch (error) {
      alert('Failed to add bill.')
    }
  }
  const addImage1Input = () => {
    const newId = image1Inputs.length
    setImage1Inputs([...image1Inputs, { id: newId }])
    setImage1InputRefs((prevRefs) => ({
      ...prevRefs,
      [newId]: React.createRef()
    }))
  }
  const addImage2Input = () => {
    const newId = image2Inputs.length
    setImage2Inputs([...image2Inputs, { id: newId }])
    setImage2InputRefs((prevRefs) => ({
      ...prevRefs,
      [newId]: React.createRef()
    }))
  }

  // Handle deletion of a bill
  const handleDelete = async (billId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this bill?'
    )
    if (!confirmDelete) return
    try {
      await axios.delete(
        `/events/${encodeURIComponent(eventName)}/bills/${billId}`
      )
      fetchBills()
    } catch (error) {
      alert('Failed to delete bill.')
    }
  }

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(
        `${NEXT_PUBLIC_PYTHON_BACKEND_URL}/download/${encodeURIComponent(
          eventName
        )}`,
        {
          responseType: 'blob'
        }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${eventName}_bills.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      alert('Failed to download PDF.')
    }
  }

  // Open image modal for bills
  const openImagesModal = (images) => {
    const imageUrls = images.map(
      (imageName) =>
        `${NEXT_PUBLIC_BACKEND_URL.replace('/api', '')}/getImage/${imageName}`
    )
    setModalImages(imageUrls)
    setShowImageModal(true)
  }

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <h1 className='text-3xl mb-4 text-center'>Event: {eventName}</h1>
      <form onSubmit={handleSubmit} className='mb-6'>
        {/* Bill Name */}
        <div className='mb-4'>
          <label className='block mb-1 font-bold'>Name of the Bill</label>
          <input
            type='text'
            name='billName'
            className='w-full border px-3 py-2'
            value={form.billName}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Description */}
        <div className='mb-4'>
          <label className='block mb-1 font-bold'>Description</label>
          <textarea
            name='description'
            className='w-full border px-3 py-2'
            value={form.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        {/* Amount */}
        <div className='mb-4'>
          <label className='block mb-1 font-bold'>Amount</label>
          <input
            type='number'
            name='amount'
            className='w-full border px-3 py-2'
            value={form.amount}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Image 1 Section */}
        <div className='mb-4'>
          <label className='block mb-1 font-bold'>Invoice</label>
          {image1Inputs.map((input, index) => (
            <div key={input.id} className='mb-2 flex items-center'>
              <input
                type='file'
                onChange={(e) => handleImage1Change(e, input.id)}
                ref={(el) => (image1InputRefs[input.id] = el)}
              />

              {image1Previews[input.id] && (
                <button
                  type='button'
                  className='ml-2 bg-gray-200 px-2 py-1 rounded'
                  onClick={() => {
                    setCurrentPreviewImage(image1Previews[input.id])
                    setShowPreviewModal(true)
                  }}
                >
                  Preview Image
                </button>
              )}
              {index !== 0 && (
                <button
                  type='button'
                  className='ml-2 text-red-500'
                  onClick={() => removeImage1Input(input.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type='button'
            className='mt-2 bg-gray-200 px-2 py-1 rounded'
            onClick={addImage1Input}
          >
            + Add another image
          </button>
        </div>

        {/* Image 2 Section */}
        <div className='mb-4'>
          <label className='block mb-1 font-bold'>Proof of Payment</label>
          {image2Inputs.map((input, index) => (
            <div key={input.id} className='mb-2 flex items-center'>
              <input
                type='file'
                onChange={(e) => handleImage2Change(e, input.id)}
                ref={(el) => (image2InputRefs[input.id] = el)}
              />

              {image2Previews[input.id] && (
                <button
                  type='button'
                  className='ml-2 bg-gray-200 px-2 py-1 rounded'
                  onClick={() => {
                    setCurrentPreviewImage(image2Previews[input.id])
                    setShowPreviewModal(true)
                  }}
                >
                  Preview Image
                </button>
              )}
              {index !== 0 && (
                <button
                  type='button'
                  className='ml-2 text-red-500'
                  onClick={() => removeImage2Input(input.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type='button'
            className='mt-2 bg-gray-200 px-2 py-1 rounded'
            onClick={addImage2Input}
          >
            + Add another image
          </button>
          {/* Hardcopy Available Checkbox */}
          <div className='mb-4'>
            <label className='inline-flex items-center'>
              <input
                type='checkbox'
                className='form-checkbox'
                checked={form.isAvailable}
                onChange={(e) =>
                  setForm({ ...form, isAvailable: e.target.checked })
                }
              />
              <span className='ml-2'>Hardcopy available</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className='bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto'
        >
          Add Bill
        </button>
      </form>

      {/* Download PDF Button */}
      <button
        className='bg-purple-500 text-white px-4 py-2 rounded mb-4 w-full sm:w-auto'
        onClick={handleDownloadPDF}
      >
        Download PDF
      </button>

      {/* Bills Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full border'>
          <thead>
            <tr>
              <th className='border px-4 py-2'>S.No.</th>
              <th className='border px-4 py-2'>Bill Name</th>
              <th className='border px-4 py-2'>Description</th>
              <th className='border px-4 py-2'>Amount</th>
              <th className='border px-4 py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => (
              <tr key={bill._id} className={`relative ${bill.isAvailable ? 'bg-green-200' : 'bg-red-200'}`}>
                <td className='border px-4 py-2'>{index + 1}</td>
                <td className='border px-4 py-2'>{bill.billName}</td>
                <td className='border px-4 py-2'>{bill.description}</td>
                <td className='border px-4 py-2 '>{bill.amount}</td>
                <td className='border px-4 py-2 relative  '>
                  <div className='flex align-middle pt-2 items-center justify-center'>
                  <button
                    className='bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-2'
                    onClick={() => {
                      if (bill.images1.length > 0) openImagesModal(bill.images1)
                      else alert('No images available')
                    }}
                  >
                    Invoice
                  </button>
                  <button
                    className='bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-2'
                    onClick={() => {
                      if (bill.images2.length > 0) openImagesModal(bill.images2)
                      else alert('No images available')
                    }}
                  >
                    Proof of payment
                  </button>
                  <button
                    className='bg-red-500 text-white px-2 py-1 rounded mb-2'
                    onClick={() => handleDelete(bill._id)}
                  >
                    Delete
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal for Bills */}
      {showImageModal && modalImages.length > 0 && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded relative max-h-screen overflow-auto'>
            {modalImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Bill Image ${idx + 1}`}
                className='max-w-full mb-4'
              />
            ))}
            <button
              className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded'
              onClick={() => {
                setShowImageModal(false)
                setModalImages([])
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && currentPreviewImage && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded relative'>
            <img
              src={currentPreviewImage}
              alt='Preview'
              className='max-w-full max-h-screen'
            />
            <button
              className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded'
              onClick={() => {
                setShowPreviewModal(false)
                setCurrentPreviewImage(null)
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
