import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import CustomInputField from '../utils/CustomInputField'
import {
    Button,
    HStack,
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Spacer,
    useDisclosure
} from '@chakra-ui/react'

export default function RaiseModal(props) {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const initialValues = {
        raise: Math.round(10 * (props.minRaise + 10))/10, // rounding to the next tenth
    }

    const validationSchema = Yup.object().shape({
        raise: Yup
                .number()
                .typeError('Invalid Amount')
                .required('Required')
                .lessThan(props.maxRaise, `Not enough chips, remaining: ${props.maxRaise}`)
                .min(props.minRaise + 1, `Has to be more than ${props.minRaise}`)
    })

    return (
        <>
        <Button 
            {...props} 
            onClick={onOpen}
            variant="solid"
            border="2px solid black"
            size="md"
            w="10rem"
        >Raise</Button>
        <Modal motionPreset="slideInBottom" isOpen={isOpen} isCentered
            onClose={() => {
                onClose()
            }}
        >
            <ModalOverlay/>
            <ModalContent fontFamily="Ubuntu Mono" className="noselect" width="20rem" >
            <ModalCloseButton/>
            <ModalHeader align="center" justify="center" >Raise</ModalHeader>
            <ModalBody align="center" justify="center">
                <Formik 
                initialValues={initialValues} 
                validationSchema={validationSchema} 
                onSubmit={async (values, actions) => {
                    await props.raiseHandler(values.raise)
                    actions.setSubmitting(false)
                    onClose()
                }}    
            >
                {({ errors, touched, isSubmitting, isValid }) => (
                <Form>
                    <HStack h="fit-content" align="flex-start">
                        <CustomInputField name="raise" error={errors.raise} touched={touched.raise}/>
                        <Spacer/>
                        <Button
                            isLoading={isSubmitting}
                            isDisabled={!isValid || props.isDisabled} 
                            type="submit"
                            colorScheme="facebook"
                            size="lg"
                            variant="solid"
                        >Raise</Button>
                    </HStack>
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
