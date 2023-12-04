const router = require('express').Router()
const path = require('path')
const CeeLicensesController = require('./controllers/CeeLicensesController');

// Requiring Ltijs
const lti = require('ltijs').Provider

// Grading route
router.post('/grade', async (req, res) => {
  try {
    const idtoken = res.locals.token // IdToken
    const score = req.body.grade // User numeric score sent in the body
    // Creating Grade object
    const gradeObj = {
      userId: idtoken.user,
      scoreGiven: score,
      scoreMaximum: 100,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded'
    }

    // Selecting linetItem ID
    let lineItemId = idtoken.platformContext.endpoint.lineitem // Attempting to retrieve it from idtoken
    if (!lineItemId) {
      const response = await lti.Grade.getLineItems(idtoken, { resourceLinkId: true })
      const lineItems = response.lineItems
      if (lineItems.length === 0) {
        // Creating line item if there is none
        console.log('Creating new line item')
        const newLineItem = {
          scoreMaximum: 100,
          label: 'Grade',
          tag: 'grade',
          resourceLinkId: idtoken.platformContext.resource.id
        }
        const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem)
        lineItemId = lineItem.id
      } else lineItemId = lineItems[0].id
    }

    // Sending Grade
    const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, gradeObj)
    return res.send(responseGrade)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send({ err: err.message })
  }
})

// Names and Roles route
router.get('/members', async (req, res) => {
  try {
    const result = await lti.NamesAndRoles.getMembers(res.locals.token)
    if (result) return res.send(result.members)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

// Deep linking route
router.post('/deeplink', async (req, res) => {
  try {
    const resource = req.body

    const items = {
      type: 'ltiResourceLink',
      title: 'Ltijs Demo',
      url: 'https://c2e-player-service.curriki.org',
      custom: {
        name: resource.name,
        value: resource.value
      }
    }

    const form = await lti.DeepLinking.createDeepLinkingForm(res.locals.token, items, { message: `Successfully Registered` })
    if (form) return res.send(form)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

router.post('/deeplink/c2elaunch', async (req, res) => {
  try {
    // const resource = req.body

    // const items = {
    //   type: 'ltiResourceLink',
    //   title: 'Ltijs Demo',
    //   //url: 'https://ltijs-demo-server.curriki.org',
    //   custom: {
    //     name: resource.name,
    //     value: resource.value
    //   }
    // }

    const form = `<HTML>

    <HEAD>
    
    <TITLE>Your Title Here</TITLE>
    
    </HEAD>
    
    <BODY BGCOLOR="FFFFFF">
    
    <CENTER><IMG SRC="clouds.jpg" ALIGN="BOTTOM"> </CENTER>
    
    <HR>
    
    <a href="http://somegreatsite.com">Link Name</a>
    
    is a link to another nifty site
    
    <H1>This is a Header</H1>
    
    <H2>This is a Medium Header</H2>
    
    Send me mail at <a href="mailto:support@yourcompany.com">
    
    support@yourcompany.com</a>.
    
    <P> This is a new paragraph!
    
    <P> <B>This is a new paragraph!</B>
    
    <BR> <B><I>This is a new sentence without a paragraph break, in bold italics.</I></B>
    
    <HR>
    
    </BODY>
    
    </HTML>`
    return res.send(form)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})
// Get user and context information
router.get('/info', async (req, res) => {
  const token = res.locals.token
  const context = res.locals.context

  const info = { }
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name
    if (token.userInfo.email) info.email = token.userInfo.email
  }

  if (context.roles) info.roles = context.roles
  if (context.context) info.context = context.context

  info.context.errors = { errors : {} }
  if (info.context.errors) info.context.errors = []

  return res.send(info)
})

router.get('/resources', CeeLicensesController.licenses)

// Wildcard route to deal with redirecting to React routes
router.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')))

module.exports = router