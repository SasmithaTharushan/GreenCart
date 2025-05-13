import React from 'react'
import { assets } from '../assets/assets'
//input field component

const InputField =({type, placeholder, name, handleChange, address})=>(
    <input className='w-full px-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
    required
    />
)

const AddAddress = () => {

    const [address, setAddress] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
    })
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...AddAddress,
            [name]: value,
        }))
    }


    const onSubmiHandler = async (e) => {
        e.preventDefault();
        
    }
  return (
    <div className='mt-16 pb-16'>
        <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping <span
        className='font-semibold text-primary'
        >Address</span> </p>

        <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
            <div className='flex-1 max-w-md'>
                <form onSubmit={onSubmiHandler} className='space-y-3 mt-6 text-sm'>
                    <div className='grid grid-cols-2 gap-4'>
                        <InputField handleChange={handleChange} address={address}
                        name='firstName' type="text" placeholder="First Name" />
                        <InputField handleChange={handleChange} address={address}
                        name='lastName' type="text" placeholder="Last Name" />
                    </div>
                    <InputField handleChange={handleChange} address={address}
                        name='email' type="email" placeholder="Email Address" />
                        

                </form>

            </div>
            <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt="Add Address" />

        </div>

    </div>
  )
}

export default AddAddress