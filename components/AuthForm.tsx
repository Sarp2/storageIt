"use client"

import { z } from "zod";
import { useState } from "react";

import Link from "next/link";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createAccount } from "@/lib/actions/user.actions";
import { signInUser } from "@/lib/actions/user.actions";

import { OTPModal } from "@/components/OTPModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
    return z.object({
        email: z.string().email(),
        fullName: formType === "sign-up" ? z.string().min(2).max(50)
            : z.string().optional(),
    })
}

export const AuthForm = ({ type }: { type: FormType }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [accountId, setAccountId] = useState("");

    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          fullName: "",
          email: "",
        },
      })
    
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const user = 
          type === "sign-up" ? await createAccount({
            fullName: values.fullName || "" ,
            email: values.email,
          }) : await signInUser({ email: values.email });

        setAccountId(user.accountId);
      } catch {
        setErrorMessage("Failed to create account. Please try again.")

      } finally {
        setIsLoading(false);
      }
    };


    return (
        <>
            <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)}
              className="auth-form"
              >
                <h1 className="form-title">
                    {type === "sign-in" ? "Sign In" : "Sign Up"}
                </h1>
                {type === "sign-up" &&  ( 
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                    <FormItem>
                        <div className="shad-form-item">
                            <FormLabel className="shad-form-label">
                                Full Name
                            </FormLabel>

                            <FormControl>
                                <Input 
                                  placeholder="Enter your full name"
                                  className="shad-input" 
                                  {...field} 
                                />
                            </FormControl>
                        </div>

                        <FormMessage className="shad-form-message" />
                    </FormItem>
                    )}
                    />
                   )}
                   <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <div className="shad-form-item">
                            <FormLabel className="shad-form-label">
                                    Email
                            </FormLabel>

                            <FormControl>
                                <Input 
                                  placeholder="Enter your email"
                                  className="shad-input" 
                                  {...field} 
                                />
                            </FormControl>
                        </div>

                        <FormMessage className="shad-form-message" />
                    </FormItem>
                    )}
                    />
                <Button
                  disabled={isLoading} 
                  type="submit"
                  className="form-submit-button">
                    {type === "sign-in" ? "Sign In" : "Sign Up"}
                    {isLoading && (
                        <Image 
                          src="/assets/icons/loader.svg"
                          alt="loader"
                          width={20}
                          height={24}
                          className="ml-2 animate-spi n"
                        />
                    )}
                </Button>

                {errorMessage && (
                    <p className="error-message">*{errorMessage}</p>
                )}
                <div className="body-2 flex justify-center">
                    <p>{type === "sign-in" 
                       ? "Don't you have an account?" 
                       : "Already you have an account"}
                    </p>
                    <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"}
                      className="ml-1 font-medium text-brand">
                        {type === "sign-in" ? "Sign Up" : "Sign In"} 
                    </Link>
                </div>
            </form>
            </Form>

            {accountId && (
              <OTPModal email={form.getValues("email")} accountId={accountId} />
            )}
      </>
    );
};
