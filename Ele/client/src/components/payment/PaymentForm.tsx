const PaymentForm = () => {
  const form = useForm({
    resolver: zodResolver(paymentSchema)
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="cardNumber"
          label="Card Number"
          type="text"
          placeholder="Card Number"
          rules={{ required: true }}
        />
        <FormField
          name="expiryDate"
          label="Expiry Date"
          type="text"
          placeholder="Expiry Date"
          rules={{ required: true }}
        />
        <FormField
          name="cvv"
          label="CVV"
          type="text"
          placeholder="CVV"
          rules={{ required: true }}
        />
        <button type="submit">Pay</button>
      </form>
    </Form>
  );
};