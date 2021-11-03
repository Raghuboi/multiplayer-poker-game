import React, { useState, useContext } from 'react'
import { UserContext } from '../../utils/UserContext'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import CustomInputField from '../utils/CustomInputField'
import {
    Button,
    Alert,
    AlertIcon,
    VStack,
    Heading,
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Spacer,
    useDisclosure,
    AlertDescription
} from '@chakra-ui/react'

const url = process.env.REACT_APP_ENDPOINT

const initialValues = {
    email: '',
    password: ''
}

const validationSchema = Yup.object().shape({
    email: Yup.string().required('Required'),
    password: Yup.string().required('Required')
})

export default function SignIn(props) {
    const [response, setResponse] = useState(null)
    const { user, setUser } = useContext(UserContext)
    const { isOpen, onOpen, onClose } = useDisclosure()

    async function onSignIn(values) {
        const body = { email: values.email, password: values.password }
        var res = await fetch(`${url}/auth/signin`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        res = await res.json()
        if (res.user) setUser(res.user)
        else setResponse(res)
    }

    async function onSignOut() {
        await fetch(`${url}/auth/signout`, { method: 'POST', credentials: 'include' })
        setUser(null)
        setResponse(null)
    }

    if (user) return (
        <>
        <Button {...props} onClick={onOpen}>Profile</Button>
        <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay/>
            <ModalContent className="noselect" width="20rem" padding="1.5rem" >
            <ModalCloseButton/>
            <ModalBody justify="center" align="center">
                <VStack spacing="1rem" >
                    <Heading size="lg">You're signed in as {user.username}</Heading>
                    <Button variant="solid" colorScheme="whatsapp" onClick={() => {onSignOut()}}>Sign Out</Button>
                </VStack>
            </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )

    else return (
        <>
        <Button {...props} onClick={onOpen}>Sign In</Button>
        <Modal motionPreset="slideInBottom" closeOnOverlayClick={false} isOpen={isOpen} isCentered
            onClose={() => {
                setResponse(null)
                onClose()
            }}
        >
            <ModalOverlay/>
            <ModalContent className="noselect" width="20rem" >
            <ModalCloseButton/>
            <ModalHeader align="center" justify="center" >Sign In</ModalHeader>
            <ModalBody align="center" justify="center">
            {response && response.error && <Alert 
                w="fit-content"
                mb="1rem" 
                justify="center" 
                align="center"
                borderRadius="0.5rem"
                padding="0.5rem 1rem" 
                variant="solid" 
                status="error" 
            >
                <AlertIcon/>
                <AlertDescription>{response.error}</AlertDescription>
            </Alert>}
            <Formik 
                initialValues={initialValues} 
                validationSchema={validationSchema} 
                onSubmit={async (values, actions) => {
                    await onSignIn(values)
                    actions.setSubmitting(false)
                }}    
            >
                {({ errors, touched, isSubmitting, isValid }) => (
                <Form>
                    <VStack justify="center" align="center" w="12.5rem" >
                        <CustomInputField name="email" label="Email" error={errors.email} touched={touched.email} />
                        <CustomInputField type="password" name="password" label="Password" error={errors.password} touched={touched.password} />
                        <Spacer/>
                        <Button
                            isLoading={isSubmitting}
                            isDisabled={!isValid} 
                            type="submit"
                            colorScheme="whatsapp"
                            size="md"
                            variant="solid"
                        >Sign In</Button>
                    </VStack>
                </Form>
                )}
            </Formik>
            <ModalFooter/>
            </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}
