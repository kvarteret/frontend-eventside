# event.kvarteret.no

Database schema ownership has moved to Alembic in
`../kvarteret-personal`. This repository consumes the live Supabase event
schema but does not own or carry production schema migrations.

[StudentBergen.no API DOCS](https://documenter.getpostman.com/view/5111196/RztrKSav)

## Utfordringer

- Hvis noen skal lage en event for Realistforeningen (RF), må eventet lages med tilhøriget for RF via StudentBergen API. Har Studentbergen mulighet til å spesifisere hvilken organisasjon det gjelder, eller kan vi 'logge inn med StudentBergen'?
