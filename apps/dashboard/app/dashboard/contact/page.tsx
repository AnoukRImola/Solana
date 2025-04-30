'use client'

import { Bounded } from '~/components/layout/Bounded'
import { WrapperForm } from '~/components/layout/Wrappers'
import ContactForm from '~/components/modules/contact/ContactForm'

const ContactsPage: React.FC = () => {
	return (
		<Bounded center={true}>
			<WrapperForm>
				<h1 className="text-4xl font-bold">Contact</h1>
				<h2>Fill in the details below to add a contact wallet.</h2>
				<ContactForm />
			</WrapperForm>
		</Bounded>
	)
}

export default ContactsPage
