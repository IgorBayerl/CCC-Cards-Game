import { z } from 'zod'
import { Form, Field } from 'react-final-form'
import InfoPageLayout from '~/components/Layout/InfoPageLayout'
import { toast } from 'react-toastify'
import emailjs from '@emailjs/browser'
import Image from 'next/image'
import {
  EnvelopeSimple,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
} from '@phosphor-icons/react'
import useTranslation from 'next-translate/useTranslation'

const NameSchema = z.string().nonempty({ message: 'Required' })
const EmailSchema = z.string().email({ message: 'Invalid email address' })
const MessageSchema = z.string().nonempty({ message: 'Required' })

const ContactSchema = z.object({
  name: z.string().nonempty({ message: 'Required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  message: z.string().nonempty({ message: 'Required' }),
})

const mapZodErrorToFinalForm = (error: z.ZodError) => {
  const errors: { [key: string]: string } = {}

  for (const issue of error.issues) {
    if (issue.path[0]) {
      errors[issue.path[0]] = issue.message
    }
  }

  return errors
}

export default function Contact() {
  const { t } = useTranslation('common')

  const onSubmit = async (values: {
    name: string
    email: string
    message: string
  }) => {
    try {
      ContactSchema.parse(values)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return mapZodErrorToFinalForm(error)
      }
    }

    const templateParams = {
      from_name: values.name,
      from_email: values.email,
      message: values.message,
    }

    try {
      await emailjs.send(
        'service_pvmiave',
        'template_zq0l2ax',
        templateParams,
        'N1b_ykYhll15Rj_fv'
      )
      const successMessage = t('i-message-sent')
      if (typeof successMessage === 'string') {
        toast.success(successMessage)
      }
    } catch (error) {
      const errorMessage = t('i-message-failed-to-send')
      if (typeof errorMessage === 'string') {
        toast.error(errorMessage)
      }
    }
  }

  return (
    <InfoPageLayout>
      <div className="flex w-full flex-col gap-5 md:flex-row">
        <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row md:flex-col ">
          <div className="flex flex-col gap-5 md:items-center">
            <Image
              src="https://github.com/IgorBayerl.png"
              alt="Igor Bayerl"
              width={150}
              height={150}
              className="rounded-full border-4  border-white"
            />
            <h1 className="text-center text-2xl">Igor Bayerl</h1>
          </div>
          <ul className="md:text-normal flex w-full flex-1 flex-col justify-center gap-3 rounded-lg bg-white bg-opacity-30 p-5 text-sm font-bold">
            <li>
              <a
                href="https://github.com/IgorBayerl"
                aria-label="GITHUB"
                target="_blank"
                rel="noopener"
                className="flex w-min items-center rounded-md  px-1 py-1  transition hover:translate-x-2"
              >
                <GithubLogo size={33} weight="bold" />
                <span className="ml-2">Github</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/igorbayerl/"
                aria-label="INSTAGRAM"
                target="_blank"
                rel="noopener"
                className="flex w-min items-center rounded-md px-1 py-1  transition hover:translate-x-2 "
              >
                <InstagramLogo size={33} weight="bold" />
                <span className="ml-2">Instagram</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/igorbayerl"
                aria-label="LINKEDIN"
                target="_blank"
                rel="noopener"
                className="flex w-min items-center rounded-md  px-1 py-1  transition hover:translate-x-2 "
              >
                <LinkedinLogo size={33} weight="bold" />
                <span className="ml-2">LinkedIn</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:dev.igorbayerl@gmail.com"
                aria-label="EMAIL"
                target="_blank"
                rel="noopener"
                className="flex w-min items-center rounded-md  px-1 py-1  transition hover:translate-x-2 "
              >
                <EnvelopeSimple size={33} weight="bold" />
                <span className="ml-2">dev.igorbayerl@gmail.com</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="flex-1 ">
          <Form
            onSubmit={onSubmit}
            render={({ handleSubmit, submitError }) => (
              <form onSubmit={void handleSubmit} className="flex flex-col">
                <h2 className="text-xl font-bold">{t('i-contact')}</h2>
                {submitError && <div>{submitError}</div>}
                <div className="form-control w-full">
                  <label className="label" htmlFor="name">
                    <span className="label-text text-white   md:text-gray-800">
                      {t('i-what-is-your-name')}
                    </span>
                  </label>
                  <Field
                    id="name"
                    name="name"
                    component="input"
                    placeholder="Name"
                    validate={(value) =>
                      NameSchema.safeParse(value).success
                        ? undefined
                        : 'Required'
                    }
                  >
                    {({ input, meta }) => (
                      <div>
                        <input
                          {...input}
                          className="input-bordered input w-full bg-opacity-50 focus:bg-opacity-70"
                          required
                        />
                        {meta.dirty && meta.error && (
                          <span className="px-1 text-sm font-bold text-error">
                            {meta.error}
                          </span>
                        )}
                      </div>
                    )}
                  </Field>
                </div>

                <div className="form-control w-full">
                  <label className="label" htmlFor="email">
                    <span className="label-text text-white md:text-gray-800">
                      Email
                    </span>
                  </label>
                  <Field
                    id="email"
                    name="email"
                    component="input"
                    placeholder="Email"
                    validate={(value) =>
                      EmailSchema.safeParse(value).success
                        ? undefined
                        : 'Invalid email address'
                    }
                  >
                    {({ input, meta }) => (
                      <div>
                        <input
                          {...input}
                          className="input-bordered input w-full bg-opacity-50 focus:bg-opacity-70"
                          required
                        />
                        {meta.dirty && meta.error && (
                          <span className="px-1 text-sm font-bold text-error">
                            {meta.error}
                          </span>
                        )}
                      </div>
                    )}
                  </Field>
                </div>
                <div className="form-control w-full">
                  <label className="label" htmlFor="message">
                    <span className="label-text text-white md:text-gray-800">
                      {t('i-message')}
                    </span>
                  </label>
                  <Field
                    name="message"
                    validate={(value) =>
                      MessageSchema.safeParse(value).success
                        ? undefined
                        : 'Required'
                    }
                  >
                    {({ input, meta }) => (
                      <div>
                        <textarea
                          {...input}
                          className="input-bordered input h-36 w-full resize-none bg-opacity-50 pt-2 focus:bg-opacity-70"
                          required
                        />
                        {meta.dirty && meta.error && (
                          <span className="px-1 text-sm font-bold text-error">
                            {meta.error}
                          </span>
                        )}
                      </div>
                    )}
                  </Field>
                </div>
                <button type="submit" className="btn mt-5">
                  {t('i-send')}
                </button>
              </form>
            )}
          />
        </div>
      </div>
    </InfoPageLayout>
  )
}
